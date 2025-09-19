import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./CatchMind.module.css";
import { useNavigate, useParams } from "react-router-dom";
import { store } from "../../../store/store";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import type { IMessage } from "@stomp/stompjs";
import api from "../../../api/mainPageApi";
import exitImg from "../../../assets/mini-game/reaction/퀴즈 나가기.png";

// tldraw 관련 타입과 컴포넌트를 import 합니다.
import { Tldraw, Editor, getSnapshot, loadSnapshot } from '@tldraw/tldraw'
import '@tldraw/tldraw/tldraw.css'
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { debounce } from 'lodash';

// --- 백엔드의 Gamer DTO와 일치하는 타입 정의 ---
type Gamer = {
    userId: number;
    nickname: string;
    points: number;
    mbtiName: string;
    profile: string;
};

// --- 백엔드의 GameStateMessage DTO와 일치하는 타입 정의 ---
type GameStateMessage = {
    status: "start" | "waiting" | "result" | "drawing" | "final" | "player_left";
    round?: number;
    timer?: number;
    drawer?: Gamer;
    answer?: string;
    answerLength?: number;
    gamers?: Gamer[];
    captain?: Gamer;
    words?: string[]; // 출제자에게만 보이는 단어 목록
};

type GameRoomInfo = {
    roomId: number;
    creatorId: number;
    roomName: string;
    playerCount: number;
};

export default function CatchMind() {
    const getUserId = () => store.getState().auth.user?.userId;
    const userId = getUserId();
    const { roomId: roomIdStr } = useParams<{ roomId: string }>();
    const roomId = roomIdStr ? parseInt(roomIdStr, 10) : 0;
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // --- 상태(State) 관리: 서버가 주는 정보만 담는 그릇으로 단순화 ---
    const [gameState, setGameState] = useState<GameStateMessage>({ status: "start" });
    const [timeLeft, setTimeLeft] = useState(0);
    const [chatMessages, setChatMessages] = useState<{ user: string; message: string }[]>([]);

    const stompClient = useRef<Client | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const userAnswerRef = useRef<string>("");

    // --- UI 렌더링을 위한 변수들 ---
    const { status, round, drawer, gamers, answer, answerLength, words } = gameState;
    const amIDrawer = drawer?.userId === userId;
    const maxRounds = gamers ? gamers.length * 2 : 0;

    const amIDrawerRef = useRef(amIDrawer);
    useEffect(() => { amIDrawerRef.current = amIDrawer; }, [amIDrawer]);

    const [editor, setEditor] = useState<Editor | null>(null);

    const editorRef = useRef(editor);
    useEffect(() => { editorRef.current = editor; }, [editor]);

    // 최신 상태를 저장할 ref 생성
    const stateRef = useRef({ amIDrawer, editor });
    useEffect(() => {
        stateRef.current = { amIDrawer, editor };
    }, [amIDrawer, editor]);

    const debouncedLoadSnapshot = useCallback(debounce((editor: Editor, snapshot: any) => {
        try {
            if (snapshot) {
                loadSnapshot(editor.store, snapshot);
            }
        } catch (e) {
            console.error("Debounced snapshot load error:", e);
        }
    }, 50), []); // ✅ 의존성 배열을 빈 배열 '[]'로 설정하여 최초 1회만 생성

    // GamerList불러오기
    const { data: gamersList } = useQuery<Gamer[]>({
        queryKey: ["gamersList", roomId],
        queryFn: async () => {
            const res = await api.get("/selectGamers", { params: { roomId } });
            console.log("플레이어들 :", res.data);
            return res.data;
        },
        staleTime: 1000 * 60 * 5,
        retry: 1,
        enabled: !!roomId,
    });

    // 현재 방 정보 불러오기
    const { data: gameRoomInfo } = useQuery<GameRoomInfo>({
        queryKey: ["gameRoomInfo", roomId],
        queryFn: async () => {
            const res = await api.get("/selectGameRoomInfo", { params: { roomId } });
            console.log("방 정보 :", res.data);
            return res.data;
        },
        staleTime: 1000 * 60 * 5,
        retry: 1,
        enabled: !!roomId,
    });

    useEffect(() => {
        if (gamersList && gameRoomInfo && !gameState.gamers) {
            const captain = gamersList.find(g => g.userId === gameRoomInfo.creatorId);

            setGameState(prevState => ({
                ...prevState,
                gamers: gamersList,
                captain: captain
            }));
        }
    }, [gamersList, gameRoomInfo, gameState.gamers]);

    const connectStomp = useCallback(() => {
        if (stompClient.current?.active) {
            console.log("Client is already active.");
            return;
        }
        const socket = new SockJS("http://localhost:8085/api/ws", null, {
            transports: ["websocket", "xhr-streaming", "xhr-polling"]
        });
        const client = new Client({
            webSocketFactory: () => socket,
            maxWebSocketChunkSize: 1024 * 1024,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,
            reconnectDelay: 5000,

            onConnect: () => {
                console.log("✅ STOMP connected");
                setIsConnected(true);
                stompClient.current = client;

                // 게임 상태용 구독
                client.subscribe(`/sub/game/${roomId}/state`, (message: IMessage) => {
                    const receivedState: GameStateMessage = JSON.parse(message.body);
                    setGameState(prevState => ({
                        ...prevState,
                        ...receivedState
                    }));
                });
                // 타이머용 구독
                client.subscribe(`/sub/game/${roomId}/timer`, (message: IMessage) => {
                    const { timer } = JSON.parse(message.body);
                    setTimeLeft(timer);
                });

                // 채팅용 구독
                client.subscribe(`/sub/chat/${roomId}`, (message: IMessage) => {
                    const chatMessage = JSON.parse(message.body); // {user: "이름", message: "내용"}
                    setChatMessages(prevMessages => [...prevMessages, chatMessage]);
                });

                // 그림판용 구독
                client.subscribe(`/sub/draw/${roomId}`, (message: IMessage) => {
                    const { editor, amIDrawer } = stateRef.current;
                    if (editor && !amIDrawer) {
                        const snapshot = JSON.parse(message.body);
                        debouncedLoadSnapshot(editor, snapshot);
                    }
                });
            },
            onDisconnect: () => {
                console.log("STOMP disconnected.");
                setIsConnected(false);
            },
        });

        client.activate();
        stompClient.current = client;

        return () => {
            console.log("Deactivating STOMP client.");
            stompClient.current?.deactivate();
        };
    }, [roomId]);

    // --- STOMP 연결 및 구독 ---
    useEffect(() => {
        if (!roomId) return;

        connectStomp();
        return () => {
            console.log("컴포넌트 정리 및 연결 해제!");
            stompClient.current?.deactivate();
        };
    }, [roomId]);

    // ================== 그림판 ==================
    // ✅ 4. tldraw 에디터가 준비되면 state에 저장하는 함수
    const handleMount = (editor: Editor) => { setEditor(editor); };
    // ✅ 5. 그림이 변경될 때마다 서버에 '분할' 전송하는 로직
    useEffect(() => {
        if (!editor || !amIDrawer) return;

        let lastSnapshot: ReturnType<typeof getSnapshot> | null = null;
        const unsubscribe = editor.store.listen(() => { lastSnapshot = getSnapshot(editor.store); },
            { source: 'user', scope: 'document' });

        const interval = setInterval(() => {
            if (lastSnapshot && stompClient.current?.connected) {
                const snapshotString = JSON.stringify(lastSnapshot);

                // ✅ [수정] 추가 메타데이터(id, index 등)를 위한 여유 공간(약 200바이트) 확보
                const overhead = 200;
                const chunkSize = (10 * 1024) - overhead; // 실제 청크 크기를 10KB보다 작게 설정

                const totalChunks = Math.ceil(snapshotString.length / chunkSize);
                const chunkId = Date.now().toString();

                for (let i = 0; i < totalChunks; i++) {
                    const chunk = snapshotString.substring(i * chunkSize, (i + 1) * chunkSize);

                    stompClient.current.publish({
                        destination: `/pub/draw/${roomId}`,
                        body: JSON.stringify({
                            id: chunkId,
                            index: i,
                            total: totalChunks,
                            chunk: chunk,
                            userId: userId
                        })
                    });
                }
                lastSnapshot = null;
            }
        }, 100);

        return () => {
            unsubscribe();
            clearInterval(interval);
        };
    }, [editor, amIDrawer, roomId, userId]);

    // ✅ 6. 라운드가 바뀌면 캔버스 초기화
    useEffect(() => {
        if (editor && (status === 'start' || status === 'waiting')) {
            editor.deleteShapes(editor.getCurrentPageShapes());
        }
    }, [status, editor]);

    useEffect(() => {
        // editor가 준비되고, 게임 상태가 'drawing'이며, 내가 출제자일 때
        if (editor && status === 'drawing' && amIDrawer) {
            editor.setCurrentTool('draw');
        }
    }, [editor, status, amIDrawer]);


    // 게임 시작 요청
    const handleStartGame = () => {
        if (gamersList !== undefined && gamersList?.length < 2) {
            alert("게임시작을위해선 최소 두명 이상의 플레이어가 있어야 합니다.")
            queryClient.invalidateQueries({ queryKey: ['gamersList'] });
            return;
        }
        if (stompClient.current && stompClient.current.connected) {
            stompClient.current.publish({ destination: `/pub/game/${roomId}/start` });
        } else {
            alert("서버와 연결이 끊겼습니다. 잠시 후 다시 시도해주세요.");
            console.error("STOMP connection is not active while trying to start game.");
        }
    };

    // 출제자가 단어 선택 요청
    const handleSelectWord = (word: string) => {
        stompClient.current?.publish({
            destination: `/pub/game/${roomId}/selectWord`,
            body: JSON.stringify({ answer: word }),
        });
    };

    // 채팅/정답 전송 요청
    const handleSendMessage = (msg: string) => {
        if (!msg.trim() || !stompClient.current?.connected) return;
        stompClient.current?.publish({
            destination: `/pub/chat/${roomId}/sendMessage`,
            body: JSON.stringify({ message: msg, userId: userId }),
        });
    };

    // 방 나가기
    const handleExitRoom = async () => {
        const confirmExit = window.confirm("게임을 종료하시겠습니까?\n게임 종료시, 대기방 목록으로 이동합니다.");
        if (confirmExit) {
            await api.post("/leaveRoom", { roomId, userId });
            queryClient.invalidateQueries({ queryKey: ['gamersList'] });
            queryClient.invalidateQueries({ queryKey: ['gamingRoomList'] });
            navigate("/miniGame/OnlineGame");
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.topBar}>
                <div className={styles.roomTitle}>
                    <button
                        className={styles.clickableTitle}
                        disabled={gameRoomInfo?.creatorId !== userId} // 방장이 아니면 비활성화
                        onClick={() => {
                            // 방 속성 바꿀 수 있도록
                        }}
                    >
                        {gameRoomInfo?.roomName}
                    </button>
                </div>
                <div className={styles.question}>
                    {status === "drawing" && amIDrawer && <span>"{answer}"을(를) 묘사해주세요.</span>}
                    {status === "drawing" && !amIDrawer && <span>{answerLength ? "_ ".repeat(answerLength) : ""} ({answerLength}글자)</span>}
                </div>
                <div className={styles.timer}>
                    {(status === "drawing" || status === "waiting" || status === "result") &&
                        `⏰ ${timeLeft}s Round ${round} of ${maxRounds}`}
                </div>
                <button className={styles.closeBtn} onClick={handleExitRoom}>
                    <img src={exitImg} className={styles.exitImg} />
                </button>
            </div>

            <div className={styles.main}>
                {/* 좌측 영역 (플레이어 목록) */}
                <div className={styles.leftPanel}>
                    {gamers?.map((gamer, index) => (
                        <div key={gamer.userId} className={styles.rankItem}>
                            {status !== "start" && (<div>#{index + 1}</div>)}
                            <div className={styles.profileContainer}>
                                {/* 방장 로직 할당 필요! */}
                                <img src={`/profile/default/${gamer.profile}`} alt={gamer.nickname} className={styles.profile} />
                                {gamer.userId === gameRoomInfo?.creatorId && <div className={styles.crownIcon}></div>}
                            </div>
                            <div className={styles.gamerInfo}>
                                <span className={styles.nickname}>
                                    <div>
                                        {gamer.userId === userId
                                            ? <span className={styles.you}>{gamer.nickname} (you)</span>
                                            : <span>{gamer.nickname}</span>
                                        }
                                        {" "}{gamer.mbtiName}
                                    </div>
                                </span>
                                <span className={styles.points}>{gamer.points} points</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 중앙 그림 영역 */}
                < div className={styles.centerPanel} >
                    {status === "start" && (
                        <div className={styles.overlayContainer}>
                            {userId === gameRoomInfo?.creatorId ? ( // 백엔드에서 방장 설정 로직 필요
                                <button className={styles.startBtn} onClick={handleStartGame} disabled={!isConnected || (gamers?.length ?? 0) < 2}>
                                    {(gamers?.length ?? 0) < 2 ? "두 명 이상 필요!!" : (isConnected ? "게임 시작" : "연결 중...")}
                                </button>
                            ) : (
                                <h2>방장이 게임을 시작하기를 기다리는 중...</h2>
                            )}
                        </div>
                    )}
                    {status === "waiting" && (
                        <div className={styles.overlayContainer}>
                            {amIDrawer ? (
                                <div className={styles.wordPickContainer}>
                                    <h2>단어를 선택하세요! ({timeLeft}초)</h2>
                                    {words?.map(word => (
                                        <button key={word} className={styles.userPick} onClick={() => handleSelectWord(word)}>
                                            {word}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <h2>{drawer?.nickname}님이 단어를 선택 중입니다...</h2>
                            )}
                        </div>
                    )}
                    {status === "drawing" && (
                        <div className={styles.drawingArea}>
                            <Tldraw onMount={handleMount} hideUi={!amIDrawer} />
                        </div>
                    )}
                    {(status === "result" || status === "final") && (
                        <div className={styles.overlayContainer}>
                            <h2 className={styles.resultTitle}>{status === "final" ? "🏆 최종 결과 🏆" : `Round ${round} 결과`}</h2>
                            {status === "result" && <p className={styles.resultAnswer}>정답: {answer}</p>}
                            {gamers?.sort((a, b) => b.points - a.points).map(gamer => (
                                <div key={gamer.userId} className={styles.resultPlayer}>
                                    {gamer.nickname}: {gamer.points} POINTS
                                </div>
                            ))}
                            {round !== 4 ? (<div>{timeLeft}초 후에 다음 라운드 시작합니다.</div>) : (
                                <div>{timeLeft}초 후에 최종 결과 화면으로 이동합니다.</div>
                            )}
                        </div>
                    )}
                </div>

                {/* 우측 채팅창 */}
                <div className={styles.rightPanel}>
                    <div className={styles.chatBox}>
                        {chatMessages.map((msg, idx) => (
                            <div key={idx} className={msg.user ? styles.chatMessage : styles.systemMessage}>
                                {msg.user ? `${msg.user}: ${msg.message}` : msg.message}
                            </div>
                        ))}
                    </div>
                    <input
                        className={styles.chatInput}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && userAnswerRef.current.trim() !== "") {
                                handleSendMessage(userAnswerRef.current);
                                e.currentTarget.value = "";
                                userAnswerRef.current = "";
                            }
                        }}
                        placeholder="정답을 입력해주세요"
                        onChange={(e) => userAnswerRef.current = e.target.value}
                    />
                </div>
            </div>
        </div>
    );

}