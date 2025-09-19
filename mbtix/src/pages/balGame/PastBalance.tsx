import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { getPast, getStats, type StatsRes } from "../../api/BalGameApi";
import styles from "./css/PastBalance.module.css";
import { Donut, MBTI_COLORS } from "../../components/balGame/Donut";
import BalGameComment from "../BalGameComment/BalGameComment";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";

export default function PastBalance() {
  const [params] = useSearchParams();
  const date = params.get("date")!;
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // ⬅️ 추가
  const [game, setGame] = useState<any | null>(null);
  const [stats, setStats] = useState<StatsRes | null>(null);
  const user = useSelector((s: RootState) => s.auth.user);


  useEffect(() => {
    getPast(date, page, 1)
      .then(async (res) => {
        const g = res.content?.[0];
        setTotalPages(res.totalPages); // ⬅️ 추가
        if (!g) return;
        setGame(g);
        const stat = await getStats(g.gameId);
        setStats(stat);
      })
      .catch(console.error);
  }, [date, page]);

  if (!game || !stats) return <div>불러오는 중...</div>;

  const options = game.options as { label: string; textContent: string }[];

  return (
    <main className={styles.main}>
      <div className={styles.head}>
        <h1>{date}의 게임</h1>

      </div>


      <section className={styles.panel}>
        <h2 className={styles.title}>{game.title}</h2>
        <p className={styles.subtitle}>총 {stats.totalVotes}명 참여</p>

        <div className={styles.optionGrid}>
          {options.map((o) => {
            const cnt = stats.options[o.label]?.cnt ?? 0;
            const ratio = stats.options[o.label]?.ratio ?? 0;
            const pie = Object.entries(stats.mbti?.[o.label] || {}).map(
              ([code, v]: any) => ({ label: code, value: (v as any).cnt })
            );

            return (
              <div key={o.label} className={styles.optionCard}>
                <div className={styles.optHead}>
                  <div className={styles.optBadge}>{o.label}</div>
                  <h3 className={styles.optTitle}>{o.textContent}</h3>
                </div>

                <p className={styles.chartTitle}>MBTI 분포</p>
                <Donut data={pie} size={100} stroke={20} />
                <ul className={styles.legend}>
                  {pie.map((p) => {
                    const color = MBTI_COLORS[p.label] || "#999";
                    return (
                      <li key={p.label} style={{ color }}>
                        ■ {p.label} {p.value}표
                      </li>
                    );
                  })}
                </ul>

                <div className={styles.countLine}>
                  <strong>{Math.round(ratio)}%</strong>
                  <span>{cnt}표</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className={styles.commentSection}>
        <BalGameComment balId={game.gameId} currentUserId={user?.userId ?? 0} variant="past" />
      </div>

      <div className={styles.pagination}>
        {page > 1 && (
          <button onClick={() => setPage((p) => p - 1)}>이전</button>
        )}

        <span>{page} / {totalPages}</span>

        {page < totalPages && (
          <button onClick={() => setPage((p) => p + 1)}>다음</button>
        )}
      </div>
      <Link to="/balanceList">
        <button className={styles.topLeftFab}>목록으로</button>
      </Link>


    </main>
  );
}
