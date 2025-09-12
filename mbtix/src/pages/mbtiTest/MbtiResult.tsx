import { useLocation, useNavigate } from "react-router-dom";
import { mbtiData, type MbtiInfo } from "../../type/mbtiData";
import styles from "./MbtiResult.module.css";

export default function MbtiResult() {
  const location = useLocation();
  const navigate = useNavigate();

  const mbti = (location.state as { mbti: string })?.mbti;
  const info: MbtiInfo | undefined = mbtiData[mbti as keyof typeof mbtiData];

  console.log("location.state:", location.state);
  console.log("받은 MBTI:", mbti);

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

  // ✅ MBTI 이미지 경로
  const imageUrl = `/profile/default/${mbti.toLowerCase()}.jpg`;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h2 className={styles.title}>당신의 MBTI는</h2>
        <h1 className={styles.type}>{info.type}</h1>

        {/* ✅ MBTI별 이미지 출력 */}
        <img src={imageUrl} alt={mbti} className={styles.profileImg} />

        <p className={styles.name}>{info.name}</p>
        <p className={styles.description}>{info.description}</p>

        <div className={styles.section}>
          <h3>💪 강점</h3>
          <ul>{info.strengths.map((s) => <li key={s}>{s}</li>)}</ul>
        </div>

        <div className={styles.section}>
          <h3>⚡ 약점</h3>
          <ul>{info.weaknesses.map((w) => <li key={w}>{w}</li>)}</ul>
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
