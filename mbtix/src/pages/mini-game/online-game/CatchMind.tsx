import { useEffect, useRef, useState } from "react";
import styles from "./CatchMind.module.css";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../../api/mainPageApi";
import { store } from "../../../store/store";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { ReactSketchCanvas, type ReactSketchCanvasRef } from "react-sketch-canvas";

type gamer = {
    roomId: number;
    creatorId: number;
    status: string;
    playerCount: number;
    nickname: string;
    mbtiName: string;
    profile: string;
    userId: number; // 각 참여중 회원번호
    points: number; // 게임에서 얻은 포인트 
};

type MyCanvasRef = ReactSketchCanvasRef & {
    addPath: (path: any) => void;
    clearCanvas: () => void;
    eraseMode: (mode: boolean) => void;
    setStrokeColor: (color: string) => void;
};

const koreanWords: string[] = [
    "사과", "바나나", "포도", "딸기", "수박",
    "고양이", "강아지", "호랑이", "사자", "코끼리",
    "책상", "의자", "컴퓨터", "휴대폰", "텔레비전",
    "학교", "병원", "도서관", "공원", "시장",
    "자동차", "자전거", "비행기", "기차", "배",
    "축구", "야구", "농구", "달리기", "수영",
    "연필", "지우개", "노트", "가방", "시계",
    "구름", "바다", "산", "강", "하늘",
    "봄", "여름", "가을", "겨울", "비",
    "눈", "바람", "해", "달", "별", "이재명", "이명박"
];

// 랜덤 단어 뽑기 함수
function getRandomWords(count: number): string[] {
    const shuffled = [...koreanWords].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

export default function CatchMind() {
    const getUserId = () => store.getState().auth.user?.userId;
    const userId = getUserId();
    console.log("현재 로그인한 회원 번호 : ", userId);

    const param = useParams<{ roomId: string }>();
    const roomId = param.roomId ? parseInt(param.roomId, 10) : 0;

    const [isConnected, setIsConnected] = useState<boolean>(false);

    const navigate = useNavigate();

    // 상태 관리
    /*
        "start" : 게임 시작 안함
        "waiting" : 게임 본격 시작, 그림 그리는 사람이 그림 고름
        "result" : 라운드 종료 후 누가 맞췄는지 나옴
        "drawing" : drawer가 그림 그리는 중
        "final" : 게임 제일 마지막 결과화면
    */
    const [status, setStatus] = useState<"start" | "waiting" | "result" | "drawing" | "final">("start");
    const [round, setRound] = useState<number>(0);
    const [roundMax, setRoundMax] = useState<number>(0);
    const [count, setCount] = useState(60);
    // 그림 그리는 사람 할당
    const [drawer, setDrawer] = useState<gamer | undefined>(undefined);
    const [gamersList, setGamersList] = useState<gamer[]>([]);

    // 로그인한 유저
    const loginUser = gamersList.find(user => user.userId === userId);

    // 방장
    const [captian, setCaptain] = useState<gamer | undefined>(undefined);

    const [answer, setAnswer] = useState<string | undefined>(undefined);
    const [words, setWords] = useState<string[]>([]);

    const timerRef = useRef<number | undefined>(undefined);

    // 채팅창
    // const [userAnswer, setUserAnswer] = useState<string>("");
    const userAnswerRef = useRef<string>("");
    // 채팅메세지 보내기
    const [chatMessages, setChatMessages] = useState<{ user: string; message: string }[]>([
        { user: "시스템", message: "1라운드 종료!!" },
        { user: "날두", message: "아..." },
        { user: "루니", message: "정답!" },
    ]);

    // =============== 게임 Status ===============
    const startGame = (): void => {
        // START 버튼 클릭 시 
        if (gamersList.length >= 2) {
            stompClient.current?.publish({
                destination: `/pub/game/${roomId}/start`,
            });
        } else {
            alert("플레이어의 수는 두 명 이상이어야 합니다.")
        }
    }

    // =============== 그림판 ===============
    const canvasRef = useRef<MyCanvasRef | null>(null);
    const stompClient = useRef<Client | null>(null);

    // 그림이 바뀔 때마다 호출
    const handleStroke = (updatedPaths: any) => {
        if (drawer?.userId !== userId) return;

        const lastPath = updatedPaths.paths?.[updatedPaths.paths.length - 1];
        if (!lastPath || !lastPath.segments) return; // segments 없으면 무시

        const drawMessage = {
            path: {
                id: lastPath.id,
                tool: lastPath.tool,
                strokeColor: lastPath.strokeColor,
                strokeWidth: lastPath.strokeWidth,
                segments: lastPath.segments.map((s: any) => ({ x: s.x, y: s.y })),
            },
            isEraser: lastPath.tool === "eraser",
        };

        console.log("send drawMessage", drawMessage);

        stompClient.current?.publish({
            destination: `/pub/draw/${roomId}`,
            body: JSON.stringify(drawMessage),
        });
    };

    // =============== 메세지 ===============
    const sendMessage = (msg: string) => {
        if (!msg.trim()) return;

        stompClient.current?.publish({
            destination: `/pub/chat/${roomId}`,
            body: JSON.stringify({
                user: loginUser?.nickname ?? "알 수 없음",
                message: msg.trim(),
            }),
        });

        // 그림 그리는 사람이 아니고, 정답과 일치하는 경우
        if (msg.trim() == answer && drawer?.userId != userId) {
            setChatMessages(prev => [
                ...prev,
                {
                    user: loginUser ? loginUser.nickname : "알 수 없음",
                    message: loginUser?.nickname + "정답을 맞추셨습니다!"
                },
            ]);
            // 포인트 업데이트 (state 갱신)
            setGamersList(prev =>
                prev?.map(g =>
                    g.userId === userId ? { ...g, points: g.points + 10 } : g
                )
            );
        }
        else {
            setChatMessages(prev => [
                ...prev,
                {
                    user: loginUser ? loginUser.nickname : "알 수 없음",
                    message: msg.trim(),
                },
            ]);
        }
    };

    // =================== STOMP 연결 ===================
    useEffect(() => {
        // STOMP 연결 한 번
        const socket = new SockJS("http://localhost:8085/api/ws");
        stompClient.current = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            onConnect: () => {
                console.log("STOMP connected");
                setIsConnected(true);
                // 게임 상태 구독
                stompClient.current?.subscribe(`/sub/game/${roomId}/status`, (message) => {
                    const { status, answerLength, answer: realAnswer } = JSON.parse(message.body);

                    setStatus(status);

                    // drawer가 아닌 사람
                    if (drawer?.userId !== userId && status === "drawing" && answerLength !== undefined) {
                        setAnswer(Array.from({ length: answerLength }, () => "_").join(" "));
                    }

                    // result나 final일 때 실제 정답 표시
                    if (status === "result" || status === "final") {
                        setAnswer(realAnswer);
                    }
                });

                // 그림판 구독
                stompClient.current?.subscribe(`/sub/draw/${roomId}`, (message) => {
                    const { path, isEraser } = JSON.parse(message.body);
                    if (!path && !isEraser) return; // path 없으면 무시
                    if (isEraser) {
                        canvasRef.current?.clearCanvas();
                    } else if (path) {
                        canvasRef.current?.addPath(path); // ✅ exportPaths 필요 없이 바로 추가
                    }
                });

                // 채팅 구독
                stompClient.current?.subscribe(`/sub/chat/${roomId}`, (message) => {
                    const { user, message: msg } = JSON.parse(message.body);
                    setChatMessages(prev => [...prev, { user, message: msg }]);
                });
            },
            onDisconnect: () => {
                console.log("STOMP disconnected");
                setIsConnected(false);
            },
            onStompError: (frame) => console.error(frame),
        });

        stompClient.current.activate();

        return () => {
            stompClient.current?.deactivate();
        };
        // ==================== 추후에 변경 ====================
    }, [roomId]); // roomId만 넣어서 방 변경 시만 새로 연결



    // 방 나가기
    /* 
        1. 내가 방장인 경우
         - 참여중인 다른 사람 무작위에게 방장 넘겨줌
        2. 내가 그림 그리는 사람인 경우
         - 시스템 메세지로 나갔다고 알림 뜨고, 다음 라운드로 넘어감 (현재판은 무효)
        3. 정답 맞추는 사람인 경우
         - 그냥 나가기 처리
    */
    const exitGameRoom = async () => {
        try {
            // 서버에 방 나가기 요청
            await api.post("/leaveRoom", { roomId: roomId, userId: userId }, {
                headers: { "Content-Type": "application/json" }
            });

            if (gamersList.length > 0) {
                // 현재 로그인한 회원(userId) 제외한 새로운 배열 만들기
                const updatedGamers = gamersList.filter(user => user.userId !== userId);
                setGamersList(updatedGamers);
                console.log("나간 후 남은 게이머 목록 :", updatedGamers);

                // 내가 방장인 경우, 아무에게 방장 넘겨주자
                if (captian?.userId == userId) {
                    const randomIndex = Math.floor(Math.random() * updatedGamers.length);
                    setCaptain(updatedGamers[randomIndex]);
                }

                // 내가 그림 그리는 사람인 경우, 라운드 자동 넘어감
                if (drawer?.userId == userId) {
                    setDrawer(undefined);
                    setRound(r => r + 1);
                    setStatus("waiting");
                }
            }
            console.log("게임방에서 나갔습니다.");
        } catch (err) {
            console.error("방 나가기 실패:", err);
            alert("방 나가기에 실패했습니다. 다시 시도해주세요.");
        }
    };

    // 왼쪽 게이머 목록 가져오기
    const { data: gamers, isLoading, isError } = useQuery<gamer[]>({
        queryKey: ["gamers", roomId],
        queryFn: async () => {
            const res = await api.get("/selectGamers", {
                params: { roomId: roomId }
            });
            setGamersList(res.data);
            console.log("게이머 번호 목록 :", res.data); // 바로 res.data 사용
            if (res.data != null) {
                for (const gamer of res.data) {
                    if (gamer.creatorId == gamer.userId) {
                        setCaptain(gamer)
                        console.log("초기 방장:", gamer);
                        // 참여중인 사용자 두배 만큼 라운드 지정
                        setRoundMax(res.data.length * 2);
                        break;
                    }
                }
            }
            console.log("게임방 번호 :", roomId);
            return res.data;
        },
        //staleTime: 1000 * 60 * 5,
        retry: 1,
        enabled: roomId > 0, // roomId가 있을 때만 실행
    });

    // 각 라운드별 상황 맞게 정보 할당해주자
    useEffect(() => {
        // 랜덤 단어 3개 뽑기
        const randomWords = getRandomWords(3);
        setWords(randomWords);
        if (round > 0) console.log(round, "이번 라운드 단어 3개:", randomWords);

        // 게이머 리스트가 있으면 무작위로 한 명 선택
        if (gamersList && gamersList.length > 0) {
            const randomIndex = Math.floor(Math.random() * gamersList.length);
            const selectedGamer = gamersList[randomIndex];
            // setDrawer(selectedGamer);
            setDrawer(loginUser);
            console.log("이번 라운드 그림 그리는 사람:", selectedGamer);
        }
    }, [round]); // round가 바뀔 때마다 실행

    // 타이머 관리
    useEffect(() => {
        // 그림 그리는 사람이 그림 그리고나서 결과화면으로 
        if (status === "drawing") {
            setCount(3);
            timerRef.current = window.setInterval(() => {
                setCount(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        setStatus("result");

                        // 서버에 status 전송
                        stompClient.current?.publish({
                            destination: `/pub/game/${roomId}/status`,
                            body: JSON.stringify({ status: "result" }),
                        });

                        stompClient.current?.publish({
                            destination: `/pub/draw/${roomId}`,
                            body: JSON.stringify({ isEraser: true }), // path 없이 isEraser만 보내도 OK
                        });

                        setRound(r => r + 1)
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        // 결과화면 보여주는 시간
        if (status === "result") {
            setCount(3);
            timerRef.current = window.setInterval(() => {
                setCount(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        if (round == roundMax) {
                            setStatus("final")
                            // 서버에 status 전송
                            stompClient.current?.publish({
                                destination: `/pub/game/${roomId}/status`,
                                body: JSON.stringify({ status: "final" }),
                            });
                        } else {
                            setStatus("waiting");
                            // 서버에 status 전송
                            stompClient.current?.publish({
                                destination: `/pub/game/${roomId}/status`,
                                body: JSON.stringify({ status: "waiting" }),
                            });
                            setRound(r => r + 1)
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        // 그림 그리는 사람 사진 기다리는 시간
        if (status === "waiting") {
            setCount(3);
            timerRef.current = window.setInterval(() => {
                setCount(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        setStatus("drawing");
                        // 서버에 status 전송
                        stompClient.current?.publish({
                            destination: `/pub/game/${roomId}/status`,
                            body: JSON.stringify({ status: "drawing" }),
                        });
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        // 최종 결과화면 
        if (status === "final") {
            setCount(3);
            timerRef.current = window.setInterval(() => {
                setCount(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        setStatus("start");
                        // 서버에 status 전송
                        stompClient.current?.publish({
                            destination: `/pub/game/${roomId}/status`,
                            body: JSON.stringify({ status: "start" }),
                        });
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timerRef.current !== undefined) {
                clearInterval(timerRef.current);
            }
        };
    }, [status]);

    if (isLoading) return <div>로딩 중...</div>;
    if (isError) return <div>데이터 로드 실패</div>;

    return (
        <div className={styles.container}>
            {/* 상단 바 */}
            <div className={styles.topBar}>
                {/* 들어와있는 회원들의 두배로 round */}
                {status == "drawing" && <div className={styles.timer}>⏰ {count}s Round {round} of {roundMax}</div>}
                <div className={styles.question}>
                    {/* 문제 나오는 부분 */}
                    {(drawer?.userId == userId && status == "drawing") && <span className={styles.word}>"{answer}"을 묘사해주세요.</span>}
                    {(drawer?.userId != userId && status == "drawing") && <span className={styles.word}>{answer ? Array.from({ length: answer.length }, () => "_").join(" ") : ""}  {answer?.length}글자</span>}
                </div>
                <button className={styles.closeBtn} onClick={async (e) => {
                    e.stopPropagation();
                    const confirmExit = window.confirm("게임을 종료하시겠습니까?\n게임 종료시, 메인화면으로 이동합니다.");
                    await exitGameRoom();
                    if (confirmExit) {
                        navigate("/miniGame/OnlineGame");
                    }
                }}>
                    X
                </button>
            </div>

            <div className={styles.main}>
                {/* 좌측 영역 */}
                <div className={styles.leftPanel}>
                    {/* 게임 시작 */}
                    {status == "start" && <button className={styles.startBtn} onClick={() => {
                        // setStatus("waiting");
                        // setRound(r => r + 1);
                        startGame();
                    }}>{isConnected ? "START" : "연결 중..."}</button>}

                    {/* 게임 끝난 화면이나 초기화면에 띄워지도록 */}
                    {/* 방장만 방삭제 가능 */}
                    {((status == "start" || status == "final") && captian?.userId == userId) &&
                        <button className={styles.startBtn}>방 삭제</button>}
                    {gamers != null && gamers.map((gamer) => {
                        return (
                            <div key={gamer.userId} className={styles.ranking}>
                                <div className={styles.rankItem}>
                                    {/* <img
                                        src=""
                                        alt="player1"
                                        className={styles.avatar}
                                    /> */}
                                    <div>
                                        <div>{gamer.nickname} {gamer.mbtiName}</div>
                                        <div className={styles.points}>{gamer.points} points</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                </div>

                {/* 중앙 그림 영역 */}
                <div className={styles.centerPanel}>
                    {(status == "waiting" && drawer?.userId == userId) && words != undefined && words.map((word) => {
                        return (
                            <button key={word} className={styles.userPick} onClick={() => {
                                // 그리는 사람이 단어 선택하면 그리는 화면으로 이동                                
                                setAnswer(word)
                                setStatus("drawing")
                                stompClient.current?.publish({
                                    destination: `/pub/game/${roomId}/status`,
                                    // 상태값과 정답길이 정답 보내주자
                                    body: JSON.stringify({
                                        status: "drawing",
                                        answerLength: word.length,
                                        answer: word
                                    }),
                                });
                            }}>
                                {word}
                            </button>
                        )
                    })}
                    {(status == "waiting" && drawer?.userId != userId) &&
                        <div className={styles.wordPickWaiting}>그림 그리는 사람이 단어 선택중입니다... 기다려주세요...</div>
                    }
                    {status === "drawing" && (
                        <div className={styles.drawingArea}>
                            <ReactSketchCanvas
                                ref={canvasRef}
                                style={{
                                    border: "2px solid #000", width: "600px", height: "400px",
                                    pointerEvents: drawer?.userId !== userId ? "none" : "auto", // drawer가 아니면 그림 못 그림
                                }}
                                strokeWidth={4}
                                strokeColor="black"
                                onStroke={(updatedPaths: any) => handleStroke(updatedPaths as any[])}
                            />

                            {/* 출제자만 컨트롤 버튼 표시 */}
                            {drawer?.userId === userId && (
                                <div className={styles.drawingControls}>
                                    <button onClick={() => canvasRef.current?.eraseMode(false)}>펜</button>
                                    <button onClick={() => canvasRef.current?.setStrokeColor("red")}>빨강</button>
                                    <button onClick={() => canvasRef.current?.setStrokeColor("blue")}>파랑</button>
                                    <button onClick={() => canvasRef.current?.eraseMode(true)}>지우개</button>
                                    <button onClick={() => canvasRef.current?.clearCanvas()}>전체 지우기</button>
                                </div>
                            )}
                        </div>
                    )}
                    {status === "result" && gamersList.length > 0 && (
                        <div className={styles.resultContainer}>
                            <div className={styles.roundTitle}>Round {round} <span>A : {answer}</span></div>
                            {gamersList.map((gamer) => (
                                <div key={gamer.userId} className={styles.resultPerRound}>
                                    {gamer.nickname} {gamer.points} POINTS
                                </div>
                            ))}
                        </div>
                    )}
                    {status === "final" && gamersList.length > 0 && (
                        <button className={styles.finalResultContainer}
                            onClick={() => {
                                // 버튼 누르면 재시작
                                setStatus("start")
                                setRound(0);
                                stompClient.current?.publish({
                                    destination: `/pub/game/${roomId}/status`,
                                    body: JSON.stringify({ status: "start" }),
                                });
                            }}>
                            <div className={styles.roundTitle}>최종 결과</div>
                            {gamersList.map((gamer) => (
                                <div key={gamer.userId} className={styles.resultPerRound}>
                                    {gamer.nickname} {gamer.points} POINTS
                                </div>
                            ))}
                        </button>
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
                        placeholder="채팅을 입력하세요."
                        defaultValue=""
                        onChange={(e) => {
                            userAnswerRef.current = e.target.value;
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                sendMessage(userAnswerRef.current);
                                e.currentTarget.value = ""; // 입력창 초기화
                                userAnswerRef.current = ""; // ref 초기화
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
};