import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./css/BalanceList.module.css";
import { getToday, getPast, type TodayGameRes, type PastListRes, type PastCard } from "../../api/BalGameApi";

export default function BalanceList() {
  const [today, setToday] = useState<TodayGameRes | null>(null);
  const [past, setPast] = useState<PastListRes | null>(null);
  const nav = useNavigate();

  useEffect(() => {
    console.log("[BalanceList] useEffect 실행됨");

    getToday()
      .then((res) => {
        console.log("[BalanceList] getToday 성공:", res);
        setToday(res);
      })
      .catch((err) => {
        console.error("[BalanceList] getToday 에러:", err);
      });

    getPast(1, 8)
      .then((res) => {
        console.log("[BalanceList] getPast 성공:", res);
        if (res.content.length === 0) {
          console.warn("[BalanceList] 지난 게임이 없습니다 (content 빈 배열)");
        }
        setPast(res);
      })
      .catch((err) => {
        console.error("[BalanceList] getPast 에러:", err);
      });
  }, []);

  console.log("[BalanceList] 렌더링 - today:", today, "past:", past);

  return (
    
    <main className={styles.main}>
       
      {/* 오늘의 밸런스게임 카드 */}
      <section className={styles.todayWrap}>
        <div
          className={styles.todayCard}
          role="button"
          tabIndex={0}
          onClick={() => nav("/balance/today")}
          onKeyDown={(e) => e.key === "Enter" && nav("/balance/today")}
        >
          
          <h2 className={styles.todayTitle}>오늘의 밸런스게임</h2>
          <p className={styles.todaySubtitle}>
            {today ? today.title : "오늘의 밸런스게임이 없습니다"}
          </p>
        </div>
      </section>

      {/* 하단: 지난 밸런스게임 그리드 */}
      <section className={styles.pastWrap}>
        <div className={styles.grid}>
          {(past?.content ?? []).map((g: PastCard) => (
            <article
              key={g.gameId}
              className={styles.card}
              role="button"
              tabIndex={0}
              onClick={() => nav(`/balance/${g.gameId}`)}
              onKeyDown={(e) => e.key === "Enter" && nav(`/balance/${g.gameId}`)}
            >
              <div className={styles.date}>{g.startAt}</div>
              <div className={styles.cardTitle}>{g.title}</div>
              
            </article>
          ))}
        </div>
      </section>

      <Link to="/">
  <button className={styles.topLeftFab}>메인으로</button>
</Link>

      {/* 우하단: 게임생성 버튼 (라우팅은 원하는 주소로 바꿔줘) */}
      <button className={styles.fab} onClick={() => nav("/balance/new")}>
        게임생성
      </button>
    </main>
  );
}
