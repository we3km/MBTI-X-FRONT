import { useEffect, useRef, useState } from "react";
import Quiz from "./SpeedQuiz.module.css"
import exit from "../../../assets/mini-game/reaction/퀴즈 나가기.png"
import wrongPic from "../../../assets/mini-game/speed-quiz/퀴즈 오답.png"
import rightPic from "../../../assets/mini-game/speed-quiz/퀴즈 정답.png"
import { useNavigate } from "react-router-dom";
import { store } from "../../../store/store";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "../../../api/mainPageApi";
import toast from 'react-hot-toast';

interface Quiz {
    question: string;
    answer: string;
}

export default function SpeedQuiz() {
    const [status, setStatus] = useState<"idle" | "waiting" | "correct" | "fail" | "final">("idle");
    const [round, setRound] = useState(1);
    const [count, setCount] = useState(5);
    const [correctCount, setCorrectCount] = useState(0);
    const navigate = useNavigate();
    const [userAnswer, setUserAnswer] = useState("");
    const userAnswerRef = useRef("");

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const getUserId = () => store.getState().auth.user?.userId;
    const userId = getUserId();

    const { data: quizData, isLoading, isError } = useQuery<Quiz[]>({
        queryKey: ["quiz"],
        queryFn: async () => {
            const res = await api.get("/speedquiz");
            return res.data;
        },
        staleTime: 1000 * 60,
        retry: 1,
    });

    const handleStart = () => {
        if (round > 5) {
            setStatus("final");
            return;
        }
        setStatus("waiting");
    };

    const handleClickArea = () => {
        if (status === "idle") {
            handleStart();
            return;
        }

        if (status === "correct" || status === "fail") {
            if (round >= 5) {
                setStatus("final");
            } else {
                setRound(r => r + 1);
                handleStart();
            }
        }
    };

    // 게임 리셋
    const handleReset = () => {
        setStatus("idle");
        setRound(1);
    };

    // 퀴즈 게임 시작 
    useEffect(() => {
        if (status === "waiting") {
            setCount(5);
            timerRef.current = setInterval(() => {
                setCount(prev => {
                    if (prev <= 1) {
                        if (timerRef.current) clearInterval(timerRef.current);
                        setStatus("fail");
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [status]);

    // 문제 정답 맞는지 확인
    const answerCheck = (input: string) => {
        const myAnswer = input
            .trim()
            .replace(/\r?\n|\r/g, "") // 줄바꿈 제거
            .toLowerCase();

        let correctAnswer: string | null = null;

        if (quizData && quizData[round - 1]) {
            correctAnswer = quizData[round - 1].answer
                .trim()
                .toLowerCase();
        }

        // 대답이 정답에 포함만 되어 있어도 ㅇㅈ해주자
        if (correctAnswer?.includes(myAnswer)) {
            setStatus("correct");
            setCorrectCount(r => r + 1);
        } else {
            setStatus("fail");
        }
    };

    // 정답 확인 
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.code === "Enter" && status === "waiting") {
                e.preventDefault();
                answerCheck(userAnswerRef.current);
                console.log("내가 답한 답 : ", userAnswerRef.current);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [status]);

    useEffect(() => {
        setUserAnswer("");
        userAnswerRef.current = "";
    }, [round]);

    // 마지막 포인트 넣기
    const handleFinalClick = () => {
        const score = correctCount * 10;
        insertPoint.mutate(score);
    };

    const insertPoint = useMutation({
        mutationFn: (score: number) => api.post("/point", {
            GAME_CODE: 1,
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

    if (isLoading) return <div>로딩 중...</div>;
    if (isError) return <div>데이터 로드 실패</div>;

    return (
        <div className={Quiz.quizGameWrapper} onClick={handleClickArea}>
            {status === "waiting" && (<h2 className={Quiz.quizPerRound}>{round}/5</h2>)}
            {status !== "final" && (
                <button
                    className={Quiz.quizBtnClose}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleReset();
                        handleExit();
                    }}
                >
                    <img src={exit} alt="게임 종료 메인페이지로 돌아가자" />
                </button>
            )}

            {status === "idle" && (
                <div
                    className={`${Quiz.quizGameScreen} ${Quiz.floatText}`}
                    style={{ cursor: "pointer" }}
                >
                    아무곳을 눌러서 시작
                    <div className={Quiz.quizFirst}>
                        <br />총 문제는 5문제이며, 각 문제당 제한시간은 5초 입니다.
                    </div>
                </div>
            )}

            {/* 문제 제출 부분 */}
            {status === "waiting" && (
                <div className={Quiz.quizGameScreen}>
                    <h1 className={Quiz.quizCount}><br />{count}</h1>
                    <div className="quizDescription">
                        {quizData !== undefined && (quizData[round - 1].question)}
                    </div>
                    <input
                        className={Quiz.quizAnswer}
                        type="text"
                        placeholder="정답 입력후, 엔터키를 눌러주세요."
                        value={userAnswer}
                        onChange={(e) => {
                            setUserAnswer(e.target.value)
                            userAnswerRef.current = e.target.value // ref 업데이트
                        }}
                    />
                </div>
            )}

            {status === "correct" && (
                <div className={Quiz.quizGameScreen} style={{ cursor: "pointer" }}>
                    <img src={rightPic} />
                    <div>정답!!</div>
                    {round === 5 ? (
                        <p>탭하여 테스트 결과를 확인하세요.</p>
                    ) : (
                        <p>탭하여 다음 라운드를 진행하세요.</p>
                    )}
                </div>
            )}

            {status === "fail" && (
                <div className={Quiz.quizGameScreen} style={{ cursor: "pointer" }}>
                    <img src={wrongPic} />
                    <div>
                        <br />정답 : {quizData !== undefined && (quizData[round - 1].answer)}</div>
                    {round === 5 ? (
                        <p>탭하여 테스트 결과를 확인하세요.</p>
                    ) : (
                        <p>탭하여 다음 라운드를 진행하세요.</p>
                    )}
                </div>
            )}

            {status === "final" && (
                <div
                    className={`${Quiz.quizGameScreen} ${Quiz.floatText}`}
                    style={{ cursor: "pointer" }}
                    onClick={handleFinalClick}
                >
                    총 {round} 문제 중에 {correctCount}문제를 맞추셨습니다!
                    <br /> {correctCount * 10} POINT 획득!!
                    <br /> 탭하여 메인화면으로 돌아가세요.
                </div>
            )}
        </div>
    );

}
