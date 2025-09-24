import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./CatchMind.module.css";
import { useNavigate, useParams } from "react-router-dom";
import { store } from "../../../store/store";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import type { IMessage } from "@stomp/stompjs";
import api from "../../../api/mainPageApi";

// tldraw 관련 타입과 컴포넌트를 import 합니다.
import { Tldraw, Editor, getSnapshot, loadSnapshot } from '@tldraw/tldraw'
import '@tldraw/tldraw/tldraw.css'
import { useQuery, useQueryClient } from "@tanstack/react-query";

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

    useEffect(() => {
        if (gamersList) {
            setGameState(prevState => ({
                ...prevState,
                gamers: gamersList
            }));
        }
    }, [gamersList]);

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

    const connectStomp = useCallback(() => {
        if (stompClient.current?.active) {
            console.log("Client is already active.");
            return;
        }
        const socket = new SockJS("http://localhost:8085/api/ws");
        const client = new Client({
            webSocketFactory: () => socket,
            maxWebSocketChunkSize: 1024 * 1024,
            heartbeatIncoming: 10000, // 10초
            heartbeatOutgoing: 10000, // 10초
            reconnectDelay: 5000,     // 5초 후 자동 재연결

            onConnect: () => {
                console.log("✅ STOMP connected");
                setIsConnected(true);
                stompClient.current = client;

                // 게임 상태용 구독
                client.subscribe(`/sub/game/${roomId}/state`, (message: IMessage) => {
                    const receivedState: GameStateMessage = JSON.parse(message.body);
                    setGameState(prevState => ({ ...prevState, ...receivedState }));
                    queryClient.invalidateQueries({ queryKey: ['gamersList', roomId] });
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
                    const snapshot = JSON.parse(message.body).data;
                    if (editor && !amIDrawer && snapshot) {
                        try {
                            loadSnapshot(editor.store, snapshot);
                        } catch (e) { console.error("Snapshot load error:", e); }
                    }
                });
            },
            onDisconnect: () => setIsConnected(false),
        });

        client.activate();
        stompClient.current = client;

        return () => {
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

    // ✅ 5. 그림이 변경될 때마다 서버에 전송하는 로직
    useEffect(() => {

        if (!editor || !amIDrawer) return;
        let lastSnapshot: ReturnType<typeof getSnapshot> | null = null;
        const unsubscribe = editor.store.listen(() => { lastSnapshot = getSnapshot(editor.store); },
            { source: 'user', scope: 'document' });

        const interval = setInterval(() => {
            if (lastSnapshot && stompClient.current?.connected) {
                stompClient.current.publish({
                    destination: `/pub/draw/${roomId}`,
                    body: JSON.stringify({ data: lastSnapshot })
                });
                lastSnapshot = null;
            }
        }, 50);

        return () => {
            console.log("리렌더링");
            unsubscribe();
            clearInterval(interval);
        };
    }, [editor, amIDrawer, roomId]);

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
            {/* 상단 바 */}
            <div className={styles.topBar}>
                {(status === "drawing") && <div className={styles.timer}>⏰ {timeLeft}s Round {round} of {maxRounds}</div>}
                <div className={styles.question}>
                    {status === "drawing" && amIDrawer && <span className={styles.word}>"{answer}"을(를) 묘사해주세요.</span>}
                    {status === "drawing" && !amIDrawer && <span className={styles.word}>{answerLength ? "_ ".repeat(answerLength) : ""} ({answerLength}글자)</span>}
                </div>
                <button className={styles.closeBtn} onClick={handleExitRoom}>X</button>
            </div>

            <div className={styles.main}>
                {/* 좌측 영역 */}
                <div className={styles.leftPanel}>
                    <div className={styles.roomTitle}>{gameRoomInfo?.roomName}</div>
                    {status === "start" && ( // 방장만 시작할 수 있도록 로직 변경
                        <button className={styles.startBtn} onClick={handleStartGame} disabled={!isConnected}>
                            {isConnected ? "START" : "연결 중..."}
                        </button>
                    )}
                    {gamers && gamers.map((gamer, index) => (
                        <div key={gamer.userId} className={styles.ranking}>
                            <div className={styles.rankItem}>
                                <div>
                                    {status !== "start" && (<div>#{index + 1}</div>)}
                                    <img src={`/profile/default/${gamer.profile}`} alt={`${gamer.nickname} profile`} className={styles.profile} />
                                    <div>{gamer.nickname} {gamer.mbtiName}</div>
                                    <div className={styles.points}>{gamer.points} points {gamer.userId == gameRoomInfo?.creatorId && "  방장"}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 중앙 그림 영역 */}
                <div className={styles.centerPanel}>
                    {status === "waiting" && (
                        <>
                            {amIDrawer ? (
                                <div>
                                    <h2>제한시간이 지나면 무작위로 단어 선택 됩니다. (남은 시간: {timeLeft}초)</h2>
                                    {words?.map(word => (
                                        <button key={word} className={styles.userPick} onClick={() => handleSelectWord(word)}>
                                            {word}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className={styles.wordPickWaiting}>{drawer?.nickname}님이 단어를 선택 중입니다...
                                    <img src={`/profile/default/${drawer?.profile}`} alt={`${drawer?.nickname} profile`} className={styles.profile} />
                                </div>
                            )}
                        </>
                    )}

                    {/* 그림 그리는 영역 */}
                    {status === "drawing" && (
                        <div className={styles.drawingArea}>
                            {status === "drawing" && (
                                <Tldraw onMount={handleMount}
                                    hideUi={!amIDrawer}
                                />
                            )}
                        </div>
                    )}

                    {status === "result" && (
                        <div className={styles.resultContainer}>
                            <div className={styles.roundTitle}>Round {round} <span>정답 : {answer} <br /> {timeLeft}초 후에 라운드 시작!</span></div>
                            {gamers?.map((gamer) => (
                                <div key={gamer.userId} className={styles.resultPerRound}>
                                    {gamer.nickname} {gamer.points} POINTS
                                </div>
                            ))}
                        </div>
                    )}

                    {status === "final" && (
                        <div className={styles.finalResultContainer}>
                            <div className={styles.roundTitle}>최종 결과</div>
                            {/* points 높은 순으로 정렬 */}
                            {gamers?.sort((a, b) => b.points - a.points).map((gamer) => (
                                <div key={gamer.userId} className={styles.resultPerRound}>
                                    {gamer.nickname} {gamer.points} POINTS
                                </div>
                            ))}
                            <div>{timeLeft}초 후에 초기화면으로 이동합니다.</div>
                        </div>
                    )}
                </div>

                {/* 우측 채팅창 */}
                <div className={styles.rightPanel}>
                    <div className={styles.chatBox}>
                        {chatMessages.map((msg, idx) => (
                            <div key={idx} className={styles.chatMessage}>
                                {msg.user} : {msg.message}
                            </div>
                        ))}
                    </div>
                    <input
                        className={styles.chatInput}
                        placeholder="정답을 입력하세요."
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && userAnswerRef.current.trim() !== "") {
                                handleSendMessage(userAnswerRef.current);
                                e.currentTarget.value = "";
                                userAnswerRef.current = "";
                            }
                        }}
                        onChange={(e) => userAnswerRef.current = e.target.value}
                    />
                </div>
            </div>
        </div>
    );
}