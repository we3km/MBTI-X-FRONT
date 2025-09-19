import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./css/BalanceList.module.css";
import { getToday, getPastDates, getMe } from "../../api/BalGameApi";


export default function BalanceList() {
  const [today, setToday] = useState<any>(null);
  const [dates, setDates] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const nav = useNavigate();

   useEffect(() => {
    getToday().then(setToday).catch(console.error);
    getPastDates().then(setDates).catch(console.error);

    // 🔑 로그인한 유저의 ROLE 가져오기
    getMe()
      .then(res => {
      console.log("현재 로그인 유저 정보:", res); // 🔍 여기 확인
      setRoles(res.roles);
    })
      .catch(err => {
        console.error("권한 조회 실패", err);
        setRoles([]);
      });
  }, []);

  return (
    <main className={styles.main}>
      <section className={styles.todayWrap}>
        <div className={styles.todayCard} onClick={() => nav("/balance/today")}>
          <h2 className={styles.todayTitle}>오늘의 밸런스게임</h2>
          <p className={styles.todaySubtitle}>{today?.title}</p>
        </div>
      </section>

      <section className={styles.pastWrap}>
  <div className={styles.grid}>
    {dates.map((date) => (
      <article
        key={date}
        className={styles.card}
        onClick={() => nav(`/balance/past?date=${date}`)}
      >
        {/* <time className={styles.cardDate}>{date}</time> */}
        <h3 className={styles.cardTitle}>{date}의<br></br> 밸런스게임</h3>
      </article>
    ))}
  </div>
</section>
 <Link to="/">
  <button className={styles.topLeftFab}>메인으로</button>
</Link>

     {/* ✅ 관리자만 게임생성 버튼 보이게 */}
      {roles.includes("ROLE_ADMIN") && (
        <button className={styles.fab} onClick={() => nav("/balance/new")}>
          게임생성
        </button>
      )}
    </main>
  );
}
