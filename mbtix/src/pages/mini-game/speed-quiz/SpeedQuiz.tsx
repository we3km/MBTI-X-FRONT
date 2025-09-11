import { useEffect, useRef, useState } from "react";
import Quiz from "./SpeedQuiz.module.css"
import exit from "../../../assets/mini-game/reaction/퀴즈 나가기.png"
import wrongPic from "../../../assets/mini-game/speed-quiz/퀴즈 오답.png"
import rightPic from "../../../assets/mini-game/speed-quiz/퀴즈 정답.png"
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store";

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

    // 퀴즈 문제 할당
    const [quizData, setQuizData] = useState<Quiz[] | null>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // 로그인 회원 번호
    const userId = useSelector((state: RootState) => state.auth.userId);

    // 데베 끌어오는 거 일단 테스트    
    useEffect(() => {
        fetch("http://localhost:8085/api/speedquiz", {
        })
            .then(res => res.json())
            .then((data: Quiz[]) => {
                setQuizData(data);
            })
            .catch(err => console.error(err));
        console.log("회원 번호 : ", userId);
    }, []);

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
    const handleFinalClick = async () => {
        try {
            await insertPoint(correctCount * 10);
            navigate("/miniGame");
        } catch (error) {
            alert("점수 저장에 실패했습니다.");
        }
    };

    const insertPoint = async (score: number) => {
        try {
            const response = await fetch("http://localhost:8085/api/point", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    GAME_CODE: 1,
                    SCORE: score,
                    USER_ID: userId
                })
            });
            if (!response.ok) {
                throw new Error("점수 전송 실패");
            }
            console.log("점수 전송 완료");
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className={Quiz.quizGameWrapper} onClick={handleClickArea}>
            {status === "waiting" && (<h2 className={Quiz.quizPerRound}>{round}/5</h2>)}
            {status !== "final" && (
                <button
                    className={Quiz.quizBtnClose}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleReset();
                        const confirmExit = window.confirm(
                            "게임을 종료하시겠습니까?\n게임 종료시, 메인화면으로 이동합니다."
                        );
                        if (confirmExit) {
                            handleReset(); // 게임 상태 초기화
                            navigate("/miniGame"); // 메인 페이지 이동
                        }
                    }}
                >
                    <img src={exit} alt="게임 종료 메인페이지로 돌아가자" />
                </button>
            )}

            {status === "idle" && (
                <div className={Quiz.quizGameScreen} style={{ cursor: "pointer" }}>
                    아무곳을 눌러서 시작
                    <div className={Quiz.quizFirst}>
                        <br />총 문제는 5문제이며, 각 문제당 제한시간은 5초 입니다.
                    </div>
                </div>
            )}

            {/* 문제 제출 부분 */}
            {status === "waiting" && (
                <div className={Quiz.quizGameScreen}>
                    <h1 className="quizCount"><br />{count}</h1>
                    <div className="quizDescription">
                        {quizData !== null && (quizData[round - 1].question)}
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
                        <br />정답 : {quizData !== null && (quizData[round - 1].answer)}</div>
                    {round === 5 ? (
                        <p>탭하여 테스트 결과를 확인하세요.</p>
                    ) : (
                        <p>탭하여 다음 라운드를 진행하세요.</p>
                    )}
                </div>
            )}

            {status === "final" && (
                <div
                    className={Quiz.quizGameScreen}
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
