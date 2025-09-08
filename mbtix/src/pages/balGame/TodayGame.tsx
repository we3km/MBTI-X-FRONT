import { useEffect, useState, useMemo } from "react";
import { getToday, postVote } from "../../api/BalGameApi";
import type { TodayGameRes } from "../../api/BalGameApi";
import styles from "./TodayGame.module.css";

export default function TodayGame() {
  const [game, setGame] = useState<TodayGameRes | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getToday()
      .then((res) => {
        const normalized =
          res && {
            ...res,
            options: res.options.map((o: any) => ({
              ...o,
              // label 정규화
              label: String(o.label).trim().toUpperCase(),
              title: o.title ?? o.text ?? "",
              votes: Number(o.votes) || 0,
            })),
          };

        console.log("오늘의 게임:", normalized);
        setGame(normalized);
      })
      .catch((err) => console.error("API 오류:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleVote = async (option: "A" | "B") => {
    if (!game || game.myVote) return; // 이미 투표했으면 막기
    try {
      await postVote(game.gameId, option);

      // 프론트에서 바로 반영 (optimistic update)
      const updated = {
        ...game,
        myVote: option,
        options: game.options.map((o) =>
          o.label === option ? { ...o, votes: o.votes + 1 } : o
        ),
      };
      setGame(updated);
    } catch (e: any) {
      if (e?.response?.status === 409) {
        alert("이미 투표했습니다.");
      } else {
        alert("투표 중 오류 발생");
      }
    }
  };

  const totals = useMemo(() => {
    if (!game) return { total: 0, byLabel: {} as Record<string, number> };

    const total = game.options.reduce((sum, o) => sum + o.votes, 0);

    const byLabel = Object.fromEntries(
      game.options.map((o) => [
        o.label,
        total > 0 ? Math.round((o.votes / total) * 100) : 0,
      ])
    );

    return { total, byLabel };
  }, [game]);

  if (loading) return <div>로딩중...</div>;
  if (!game) return <div>오늘의 밸런스 게임이 없습니다</div>;

  return (
    <main className={styles.main}>
      <h1 className={styles.h1}>오늘의 밸런스 게임</h1>
      <p className={styles.subtitle}>단 하나만 고를 수 있다면?</p>

      <section className={styles.game}>
        <p className={styles.question}>{game.title}</p>
        <div className={styles.grid}>
          {game.options.map((o) => {
            const percent = totals.byLabel[o.label] ?? 0;

            return (
              <article
                key={o.label}
                className={`${styles.option} ${
                  game.myVote === o.label ? styles.selected : ""
                }`}
              >
                <div className={styles.optHead}>
                  <div className={styles.optBadge}>{o.label}</div>
                  <h3 className={styles.optTitle}>{o.title}</h3>
                </div>
                <button
                  disabled={!!game.myVote}
                  onClick={() => handleVote(o.label)}
                >
                  투표하기
                </button>
                {game.myVote && (
                  <div
                    className={styles.result}
                    style={{ ["--pct" as any]: percent }}
                  >
                    <div className={styles.resultTop}>
                      <strong>{percent}%</strong>
                      <span>{o.votes}표</span>
                    </div>
                    <div className={styles.bar}></div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
        {game.myVote && (
          <p className={styles.total}>
            총 <strong>{totals.total}</strong>명 참여
          </p>
        )}
      </section>
    </main>
  );
}
