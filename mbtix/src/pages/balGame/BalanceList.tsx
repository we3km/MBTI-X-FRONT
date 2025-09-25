import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./css/BalanceList.module.css";
import { getToday, getPastDates, getPastByDate, getMe } from "../../api/BalGameApi";

export default function BalanceList() {
  const [today, setToday] = useState<any>(null);
  const [dates, setDates] = useState<{ date: string; games: any[] }[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  const nav = useNavigate();

  // ✅ 지난 날짜 + 게임 불러오기
  useEffect(() => {
    getPastDates()
      .then(async (res: string[]) => {
        const dateWithGames = await Promise.all(
          res.map(async (d) => {
            const games = await getPastByDate(d);
            return { date: d, games };
          })
        );
        setDates(dateWithGames);
      })
      .catch(console.error);
  }, []);

  // ✅ 오늘의 게임 불러오기
  useEffect(() => {
    getToday(1, 1)
      .then((res) => {
        setToday(res.content[0] ?? null);
      })
      .catch(console.error);
  }, []);

  // ✅ 현재 사용자 권한 확인
  useEffect(() => {
    getMe()
      .then((res) => setRoles(res.roles))
      .catch(() => setRoles([]));
  }, []);

  // ✅ 아코디언 토글
  const toggleExpand = (date: string) => {
    setExpanded(expanded === date ? null : date);
  };

  return (
    <main className={styles.main}>
      {/* 오늘의 게임 */}
      <section className={styles.todayWrap}>
        <div
          className={styles.todayCard}
          onClick={() => nav("/balance/today")}
        >
          <h2 className={styles.todayTitle}>오늘의 밸런스게임</h2>
          <p className={styles.todaySubtitle}>
            {today?.title ? null : "게임 없음"}
          </p>
        </div>
      </section>

      {/* 지난 게임 (날짜별 카드) */}
      <section className={styles.pastWrap}>
        <div className={styles.grid}>
          {dates.map(({ date, games }) => (
            <article key={date} className={styles.card}>
              {/* 카드 헤더: 아코디언 */}
              <header
                className={styles.cardHeader}
                onClick={() => toggleExpand(date)}
              >
                <h3 className={styles.cardTitle}>
                  {date}의 밸런스게임 ({games.length}개)
                </h3>
              </header>

              {/* 아코디언 확장 */}
              {expanded === date && (
                <div className={styles.previewList}>
                  {games.map((g) => (
                    <div key={g.gameId} className={styles.previewItem}>
                      <strong>{g.title}</strong>
                      {g.options?.length >= 2 && (
                        <p>
                          A: {g.options[0].textContent} vs B:{" "}
                          {g.options[1].textContent}
                        </p>
                      )}
                    </div>
                  ))}

                  {/* 👉 카드(날짜) 별 상세 페이지 이동 버튼 */}
                  <button
                    className={styles.moreBtn}
                    onClick={(e) => {
                      e.stopPropagation(); // 아코디언 닫힘 방지
                      if (games.length > 0) {
                        // 첫 번째 게임 상세 페이지로 이동
                        nav(`/balance/past?date=${date}`);
                      }
                    }}
                  >
                    더보기 →
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* 관리자 전용 버튼 */}
      {roles.includes("ROLE_ADMIN") && (
        <button className={styles.fab} onClick={() => nav("/balance/new")}>
          게임생성
        </button>
      )}
    </main>
  );
}
