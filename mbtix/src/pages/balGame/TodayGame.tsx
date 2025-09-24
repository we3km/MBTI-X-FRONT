import { useEffect, useState } from "react";
import { getToday, postVote, getStats, type TodayGameRes, type StatsRes } from "../../api/BalGameApi";
import styles from "./css/TodayGame.module.css";
import { Link } from "react-router-dom";
import { Donut, MBTI_COLORS } from "../../components/balGame/Donut";
import BalGameComment from "../BalGameComment/BalGameComment";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";

export default function TodayGame() {
  const [games, setGames] = useState<TodayGameRes[]>([]);
  const [statsMap, setStatsMap] = useState<Record<number, StatsRes>>({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const user = useSelector((state: RootState) => state.auth.user);
  const [totalPages, setTotalPages] = useState(1);

  // 오늘의 게임 목록 불러오기
  useEffect(() => {
    setLoading(true);
    getToday(page, 1)
      .then((res) => {
        setGames(res.content);           // ✅ content 사용
        setTotalPages(res.totalPages);   // ✅ totalPages 사용
        res.content.forEach((g) => {     // ✅ content.forEach
          getStats(g.gameId)
            .then((s) => setStatsMap((prev) => ({ ...prev, [g.gameId]: s })))
            .catch(console.error);
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  // 투표하기
  const handleVote = async (game: TodayGameRes, option: "A" | "B") => {
    if (game.myVote) return;
    try {
      await postVote(game.gameId, option);

      setGames((prev) =>
        prev.map((g) =>
          g.gameId === game.gameId
            ? {
              ...g,
              myVote: option,
              options: g.options.map((o) =>
                o.label === option ? { ...o, votes: o.votes + 1 } : o
              ),
            }
            : g
        )
      );

      const latest = await getStats(game.gameId);
      setStatsMap((prev) => ({ ...prev, [game.gameId]: latest }));
    } catch (e: any) {
      if (e?.response?.status === 409) {
        alert("이미 투표했습니다.");
      } else {
        alert("투표 중 오류 발생");
      }
    }
  };

  if (loading) return <div>로딩중...</div>;
  if (!games.length) return <div>오늘의 밸런스 게임이 없습니다</div>;

  return (
    <main className={styles.main}>
      <h1 className={styles.h1}>오늘의 밸런스 게임</h1>
      <p className={styles.subtitle}>단 하나만 고를 수 있다면?</p>


      {games.map((game) => {
        const stats = statsMap[game.gameId];

        const aVotes = Number(game.options.find((o) => o.label === "A")?.votes) || 0;
        const bVotes = Number(game.options.find((o) => o.label === "B")?.votes) || 0;
        const total = aVotes + bVotes;
        const pctA = total > 0 ? Math.round((aVotes / total) * 100) : 0;
        const pctB = total > 0 ? 100 - pctA : 0;

        const pieA = Object.entries(stats?.mbti?.A || {}).map(([code, v]: any) => ({
          label: code,
          value: v.cnt,
        }));
        const pieB = Object.entries(stats?.mbti?.B || {}).map(([code, v]: any) => ({
          label: code,
          value: v.cnt,
        }));

        return (
          <section key={game.gameId} className={styles.game}>
            <p className={styles.question}>{game.title}</p>
            <div className={styles.grid}>
              {game.options.map((o) => (
                // TodayGame.tsx (일부 수정)
                <article
                  key={o.label}
                  className={`${styles.option} ${game.myVote ? styles.flipped : ""}`}

                >
                  <div className={styles.cardInner}>
                    {/* 앞면 */}
                    <div className={styles.cardFront}>
                      <div className={styles.optHead}>
                        <div className={styles.optBadge}>{o.label}</div>
                        <h3 className={styles.optTitle}>{o.textContent}</h3>
                      </div>

                      {!game.myVote && (
                        <button
                          className={styles.voteBtn}
                          onClick={() => handleVote(game, o.label as "A" | "B")}
                        >
                          투표하기
                        </button>
                      )}
                    </div>

                    {/* 뒷면 — ✅ 헤더(뱃지+옵션명) 추가 */}
                    <div className={styles.cardBack}>
                      <div className={styles.optHead}>
                        <div className={styles.optBadge}>{o.label}</div>
                        <h3 className={styles.optTitle}>{o.textContent}</h3>
                      </div>

                      {stats && (
                        <>
                          <div className={styles.donutBox}>
                            <h4>MBTI 분포</h4>
                            <Donut data={o.label === "A" ? pieA : pieB} />
                            <div className={styles.legend}>
                              {(o.label === "A" ? pieA : pieB).map((d) => {
                                const color = MBTI_COLORS[d.label] || "#ADB5BD";
                                return (
                                  <div key={d.label} style={{ color }}>
                                    ■ {d.label} {d.value}표
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div
                            className={styles.result}
                            style={{ ["--pct" as any]: o.label === "A" ? pctA : pctB }}
                          >
                            <div className={styles.resultTop}>
                              <strong>{o.label === "A" ? pctA : pctB}%</strong>
                              <span>{Number(o.votes) || 0}표</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </article>



              ))}
            </div>

            {game.myVote && (
              <p className={styles.total}>
                총 <strong>{total}</strong>명 참여
              </p>
            )}

            {/* 댓글 */}
            {game.myVote && (
              <BalGameComment balId={game.gameId} currentUserId={user?.userId ?? 0} variant="today" />
            )}
          </section>
        );
      })}


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
