import { useLocation, useNavigate } from "react-router-dom";
import { mbtiData, type MbtiInfo } from "../../type/mbtiData";
import styles from "./MbtiResult.module.css";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { submitMbtiAnswersDetail, type MbtiDetailRes } from "../../api/mbtiTestApi";

export default function MbtiResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((s: RootState) => s.auth.user);

  // 이전 페이지에서 answers를 함께 전달했다고 가정
  const { mbti, answers } = location.state as { mbti: string; answers: { questionId: number; choice: string }[] };
  const info: MbtiInfo | undefined = mbtiData[mbti as keyof typeof mbtiData];

  const [result, setResult] = useState<MbtiDetailRes | null>(null);

  useEffect(() => {
    if (!user?.userId || !answers) return;
    submitMbtiAnswersDetail(user.userId, answers)
      .then((res) => {
        console.log("👉 MBTI 상세 결과 API 응답:", res); // ✅ 응답 확인
        setResult(res);
      })
      .catch((err) => console.error("MBTI 결과 불러오기 실패:", err));
  }, [user?.userId, answers]);

  if (!info || !mbti) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <p>결과 정보가 없습니다 😢</p>
          <button onClick={() => navigate("/")}>메인으로</button>
        </div>
      </div>
    );
  }

  const imageUrl = `/profile/default/${mbti.toLowerCase()}.jpg`;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h2 className={styles.title}>당신의 MBTI는</h2>
        <h1 className={styles.type}>{info.type}</h1>

        <img src={imageUrl} alt={mbti} className={styles.profileImg} />

        <p className={styles.name}>{info.name}</p>
        <p className={styles.description}>{info.description}</p>

        {/* ✅ 퍼센트 바 차트 */}
        {result ? (
          <div className={styles.chartBox}>
            {[
              { left: "E", right: "I", leftPct: result.ratios.EI.E, rightPct: result.ratios.EI.I },
              { left: "S", right: "N", leftPct: result.ratios.SN.S, rightPct: result.ratios.SN.N },
              { left: "T", right: "F", leftPct: result.ratios.TF.T, rightPct: result.ratios.TF.F },
              { left: "P", right: "J", leftPct: result.ratios.JP.P, rightPct: result.ratios.JP.J }, // PJ 순서
            ].map((d) => (
              <div key={`${d.left}${d.right}`} className={styles.barRow}>
                <div className={styles.barLabels}>
                  <span>{d.left}</span>
                  <span>{d.right}</span>
                </div>
                <div className={styles.bar}>
                  {d.leftPct > 0 && (
                    <div className={styles.barLeft} style={{ width: `${d.leftPct}%` }}>
                      {d.left} {d.leftPct}%
                    </div>
                  )}
                  {d.rightPct > 0 && (
                    <div className={styles.barRight} style={{ width: `${d.rightPct}%` }}>
                      {d.right} {d.rightPct}%
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: "1rem", marginBottom: "2rem", color: "#999" }}>불러오는 중...</p>
        )}

        <div className={styles.strengthWeakness}>
          <div className={styles.section}>
            <h3>👍 강점</h3>
            <ul>{info.strengths.map((s) => <li key={s}>{s}</li>)}</ul>
          </div>

          <div className={styles.section}>
            <h3>👎 약점</h3>
            <ul>{info.weaknesses.map((w) => <li key={w}>{w}</li>)}</ul>
          </div>
        </div>

        <button className={styles.retryBtn} onClick={() => navigate("/MbtiTest")}>
          다시 검사하기
        </button>
        <button className={styles.retryBtn} onClick={() => (window.location.href = "/")}>
          메인으로
        </button>
      </div>
    </div>
  );
}
