import { useLocation, useNavigate } from "react-router-dom";
import { mbtiData, type MbtiInfo } from "../../type/mbtiData";
import styles from "./MbtiResult.module.css";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { getMbtiRatio } from "../../api/mbtiTestApi";

export default function MbtiResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((s: RootState) => s.auth.user);

  const mbti = (location.state as { mbti: string })?.mbti;
  const info: MbtiInfo | undefined = mbtiData[mbti as keyof typeof mbtiData];

  const [ratio, setRatio] = useState<number | null>(null);
  const [ratioError, setRatioError] = useState(false);

  useEffect(() => {
  if (!user?.userId) return;

  getMbtiRatio(user.userId)
    .then((data) => {
      const r = Number(data?.ratio);
      if (!isNaN(r) && r > 0) {
        setRatio(r);
      } else {
        setRatioError(true);
      }
    })
    .catch((err) => {
      console.error("비율 가져오기 실패:", err);
      setRatioError(true);
    });
}, [user?.userId]);

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

        {/* ✅ 안전한 비율 출력 */}
        {ratio !== null ? (
          <p style={{ fontSize: "1.1rem", marginBottom: "2rem", color: "#334155" }}>
            당신과 같은 유형은 전체 사용자 중{" "}
            <strong style={{ color: "#0ea5e9" }}>{ratio}%</strong> 입니다.
          </p>
        ) : ratioError ? (
          <p style={{ fontSize: "1rem", marginBottom: "2rem", color: "#999" }}>
            비율 데이터를 불러올 수 없습니다.
          </p>
        ) : (
          <p style={{ fontSize: "1rem", marginBottom: "2rem", color: "#999" }}>
            불러오는 중...
          </p>
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
