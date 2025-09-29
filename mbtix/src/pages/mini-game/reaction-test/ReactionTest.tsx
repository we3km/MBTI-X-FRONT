import { useEffect, useRef, useState } from "react";
import Reaction from "./ReactionTest.module.css"
import exit from "../../../assets/mini-game/reaction/퀴즈 나가기.png"
import warning from "../../../assets/mini-game/reaction/순발력게임_경고 사진.png"
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { store } from "../../../store/store";
import api from "../../../api/mainPageApi";
import { useMutation } from "@tanstack/react-query";
import toast from 'react-hot-toast';

export default function ReactionTest() {
    const [status, setStatus] = useState<"idle" | "waiting" | "ready" | "fail" | "result" | "final">("idle");
    const [round, setRound] = useState(1);
    const [time, setTime] = useState<number | null>(null);

    const [bestTime, setBestTime] = useState<number | null>(null);
    const [history, setHistory] = useState<number[]>([]);

    const timeoutRef = useRef<number | null>(null);
    const startRef = useRef(0);

    const navigate = useNavigate();

    const getUserId = () => store.getState().auth.user?.userId;
    const userId = getUserId();

    const avgTime = history.length > 0
        ? history.reduce((a, b) => a + b, 0) / history.length
        : 0;

    let stars = 1;
    let you = "🐛";
    if (avgTime < 210 && avgTime >= 180) {
        stars = 5;
        you = "🐆"
    }
    else if (avgTime < 240) {
        stars = 4;
        you = "🐱";
    }
    else if (avgTime < 270) {
        stars = 3;
        you = "🐦"
    }
    else if (avgTime < 300) {
        stars = 2;
        you = "🐍"
    }
    // 각 라운드 별 기록 그래프
    interface RoundGraphProps {
        history: number[];
    }

    function RoundGraph({ history }: RoundGraphProps) {
        const data = history.map((time: number, index: number) => ({
            round: index + 1,
            time,
        }));

        const axisStyle = { fill: "white", fontSize: 18 }; // 흰색 글씨

        return (
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="4 4" stroke="#555555" /> {/* 그리드 색상 조절 */}
                    <XAxis dataKey="round" tick={axisStyle} />
                    <YAxis tick={axisStyle} />
                    <Tooltip contentStyle={{ backgroundColor: "#333", color: "white" }} /> {/* 툴팁 배경, 글씨 */}
                    <Line type="monotone" dataKey="time" stroke="#40518eff" strokeWidth={3} />
                </LineChart>
            </ResponsiveContainer>
        );
    }

    // 새로운 라운드 시작, 시간 초기화
    useEffect(() => {
        return () => {
            if (timeoutRef.current !== null) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // 게임 시작
    const handleStart = () => {
        if (round > 5) {
            setStatus("final");
            return;
        }

        setStatus("waiting");
        const delay = Math.floor(Math.random() * 2000) + 1000;

        timeoutRef.current = window.setTimeout(() => {
            setStatus("ready");
            startRef.current = performance.now();
        }, delay);
    };

    // ========================== 클릭 영역 ==========================
    const handleClickArea = () => {
        if (status === "idle") {
            handleStart();
            return;
        }
        if (status === "waiting") {
            if (timeoutRef.current !== null) {
                clearTimeout(timeoutRef.current);
            }
            setStatus("fail");
            return;
        }
        if (status === "ready") {
            const end = performance.now();
            const reaction = Math.round(end - startRef.current);

            setBestTime(prev => (prev === null || reaction < prev ? reaction : prev));
            setHistory(prev => [...prev, reaction]);

            setTime(reaction);
            setStatus("result");
            return;
        }
        if (status === "result") {
            if (round >= 5) {
                setStatus("final");
            } else {
                setRound(r => r + 1);
                handleStart();
            }
        }
        if (status === "fail") {
            setStatus("waiting");
            const delay = Math.floor(Math.random() * 2000) + 1000;
            timeoutRef.current = window.setTimeout(() => {
                setStatus("ready");
                startRef.current = performance.now();
            }, delay);
        }
    };

    // 게임 리셋
    const handleReset = () => {
        if (timeoutRef.current !== null) {
            clearTimeout(timeoutRef.current);
        }
        setStatus("idle");
        setRound(1);
        setTime(null);
        // setLastTime(null);
        setBestTime(null);
        setHistory([]);
    };

    // 스페이스바 누를 경우
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.code === "Space") {
                e.preventDefault();
                handleClickArea();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [status]);

    // 마지막 포인트 넣기
    const handleFinalClick = () => {
        const score = stars * 10;
        insertPoint.mutate(score);
    };

    const insertPoint = useMutation({
        mutationFn: (score: number) => api.post("/point", {
            GAME_CODE: 2,
            SCORE: score,
            USER_ID: userId
        }),
        onSuccess: () => {
            console.log("점수 전송 완료");
            navigate("/miniGame");
        },
        onError: (error) => {
            console.error("점수 전송 실패:", error);
            navigate("/miniGame");
        },
    });

    const handleExit = () => {
        toast((t) => (
            <div>
                <p>게임을 종료하시겠습니까?<br />종료 시 메인 화면으로 이동합니다.</p>
                <div style={{ marginTop: '8px', display: 'flex', gap: '8px', width: '100%' }}>
                    <button
                        onClick={() => {
                            handleReset();
                            navigate("/miniGame");
                            toast.dismiss(t.id); // 토스트 닫기
                        }}
                        style={{ backgroundColor: 'red', color: 'white', padding: '4px 8px', borderRadius: '12px', flex: 1 }}
                    >
                        종료
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)} // 취소
                        style={{ backgroundColor: 'gray', color: 'white', padding: '4px 8px', borderRadius: '12px', flex: 1 }}
                    >
                        취소
                    </button>
                </div>
            </div>
        ), {
            duration: Infinity, // 사용자가 선택할 때까지 유지
        });
    };

    return (
        <div className={Reaction.reactionGameWrapper} onClick={handleClickArea}>
            {status !== "final" && (
                <button className={Reaction.reactionBtnClose}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleReset();
                        handleExit();
                    }}>
                    <img src={exit} alt="게임 종료" />
                </button>
            )}

            {status === "idle" && (
                <div className={`${Reaction.reactionGameScreen} ${Reaction.floatUpDown}`}
                    style={{ cursor: "pointer" }}>
                    아무 곳을 눌러서 시작
                    <div className={Reaction.reactionDescription}>
                        준비가 되면 초록색으로 변하고 누르면 반응 시간이 측정됩니다.
                    </div>
                </div>
            )}

            {status === "waiting" && (
                <div className={Reaction.reactionGameScreen}>
                    <div className={`${Reaction.reactionCircle} ${Reaction.reactionRed}`}>
                        ROUND {round}<br />초록색을 기다리세요...
                    </div>
                </div>
            )}

            {status === "ready" && (
                <div className={Reaction.reactionGameScreen}>
                    <div className={`${Reaction.reactionCircle} ${Reaction.reactionGreen}`}>
                        지금!!
                    </div>
                </div>
            )}

            {status === "fail" && (
                <div className={Reaction.reactionGameScreen} style={{ cursor: "pointer" }}>
                    <div className={Reaction.reactionWarning}>
                        <img src={warning} />
                    </div>
                    <p>너무 빨라요!<br />탭하여 다시 시도하세요.</p>
                </div>
            )}

            {status === "result" && (
                <div className={Reaction.reactionGameScreen} style={{ cursor: "pointer" }}>
                    <p className={Reaction.reactionRoundScore}>ROUND {round}</p>
                    <h3>{time} MS</h3>
                    <RoundGraph history={history} />
                    {round === 5 && (<p>탭하여 테스트 결과를 확인하세요.</p>)}
                    {round !== 5 && (<p>탭하여 다음 라운드를 진행하세요.</p>)}
                </div>
            )}

            {status === "final" && (
                <div className={Reaction.reactionGameScreen}
                    style={{ cursor: "pointer" }} onClick={handleFinalClick}>
                    <h5>나의 평균 반응 속도 테스트 결과는:</h5>
                    <p className={`${Reaction.reactionResultScore} ${Reaction.scoreGlow} ${Reaction.scorePop}`}>
                        {avgTime.toFixed(2)}ms
                    </p>
                    <p>최고 기록: {bestTime ?? "-"} ms</p>
                    <p>당신은 {you} 입니다.</p>
                    <div className={Reaction.reactionStars}>
                        {Array.from({ length: 5 }, (_, i) => (
                            <span key={i} className={Reaction.reactionStarWrapper}>
                                <span className={Reaction.reactionStarEmpty}>☆</span>
                                {i < stars && (
                                    <span
                                        className={Reaction.reactionStarFilled}
                                        style={{ animationDelay: `${i * 0.5}s` }} // 왼쪽부터 순차적
                                    >
                                        ★
                                    </span>
                                )}
                            </span>
                        ))}
                    </div>
                    <p>{stars * 10} POINT 획득!!</p>
                    <p className={Reaction.floatUpDown}>탭하여 메인화면으로 돌아가세요.</p>
                </div>
            )}
        </div >
    );
}
