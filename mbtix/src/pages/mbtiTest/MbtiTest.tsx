import { useEffect, useState } from "react";
import {  useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { getMbtiQuestions, submitMbtiAnswers } from "../../api/mbtiTestApi";
import type { RootState } from "../../store/store";
import styles from "./MbtiTest.module.css";

type Question = {
    id: number;
    question: string;
    aType: string;
    bType: string;
};

export default function MbtiTest() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<{ questionId: number; choice: string }[]>([]);
    const [loading, setLoading] = useState(true);

    const user = useSelector((state: RootState) => state.auth.user);
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getMbtiQuestions();
                setQuestions(data);
            } catch (err) {
                console.error("질문 불러오기 실패:", err);
                alert("질문을 불러오는데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const selectAnswer = (qid: number, choice: string) => {
        setAnswers((prev) => {
            const exists = prev.some((a) => a.questionId === qid);
            if (exists) return prev.map((a) => (a.questionId === qid ? { ...a, choice } : a));
            return [...prev, { questionId: qid, choice }];
        });
    };

  const handleSubmit = async () => {
  if (!user?.userId) {
    alert("로그인이 필요합니다.");
    return;
  }

  if (answers.length < questions.length) {
    // ✅ 아직 답 안한 질문 찾기
    const answeredIds = answers.map((a) => a.questionId);
    const firstUnanswered = questions.find(
      (q) => !answeredIds.includes(q.id)
    );

    if (firstUnanswered) {
  const el = document.getElementById(`question-${firstUnanswered.id}`);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "center" });

    // ⭐️ 깜빡임 애니메이션 재시작 트릭
    el.classList.remove(styles.unanswered); // 먼저 제거
    void el.offsetWidth;                    // 리플로우 강제 → 애니메이션 초기화
    el.classList.add(styles.unanswered);    // 다시 추가

    setTimeout(() => el.classList.remove(styles.unanswered), 5000);
  }
}

    alert("모든 질문에 답해주세요!");
    return;
  }

  try {
  const result = await submitMbtiAnswers(user.userId, answers);

  // 결과 페이지로 이동 먼저
  navigate("/MbtiResult", { state: { mbti: result } });
} catch (err) {
  console.error("결과 전송 실패:", err);
  alert("결과를 전송하는 중 오류가 발생했습니다.");
}
};



    if (loading) return <p className="text-center mt-10">로딩 중...</p>;

    const progress = Math.round((answers.length / questions.length) * 100);

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <Link to="/">
                    <button className={styles.topLeftFab}>메인으로</button>
                </Link>

                {/* ✅ 진행률 바 */}
                <div className={styles.progressContainer}>
                    <div className={styles.progressText}>
                        {answers.length}/{questions.length} ({progress}%)
                    </div>
                    <div className={styles.progressWrap}>
                        <div
                            className={styles.progressBar}
                            style={{ width: `${progress}%`, backgroundPosition: `${progress}% 0%` }}
                        />
                    </div>
                </div>

                <h2 className={styles.title}>MBTI 검사</h2>

                <div className={styles.questions}>
                    {questions.map((q, idx) => {
                        const qKey = Number(q.id ?? idx);
                        const selected = answers.find((a) => a.questionId === qKey)?.choice;

                        return (
                            <div key={qKey}
                              id={`question-${qKey}`}  
                              data-id={qKey}  
                             className={styles.card}>
                                <p className={styles.question}>
                                    {idx + 1}. {q.question}
                                </p>

                                <div className={styles.options}>
                                    <div
                                        className={`${styles.option} ${selected === "A" ? styles.optionSelected : ""}`}
                                        onClick={() => selectAnswer(qKey, "A")}
                                    >
                                        예
                                    </div>
                                    <div
                                        className={`${styles.option} ${selected === "B" ? styles.optionSelected : ""}`}
                                        onClick={() => selectAnswer(qKey, "B")}
                                    >
                                        아니요
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className={styles.submitArea}>
                    <button onClick={handleSubmit} className={styles.submitBtn}>
                        결과 확인하기
                    </button>
                </div>
            </div>
        </div>
    );
}

