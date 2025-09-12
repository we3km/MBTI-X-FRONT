import { useEffect, useState, useMemo } from "react";
import { getToday, postVote, getStats, type TodayGameRes, type StatsRes } from "../../api/BalGameApi";
import { gameCountdown } from "../../hooks/gameCountdown";
import styles from "./css/TodayGame.module.css";
import { Link } from "react-router-dom";
import { Donut, MBTI_COLORS } from "../../components/balGame/Donut";
import BalGameComment from "../BalGameComment/BalGameComment"; // ⬅️ 댓글 컴포넌트 import
import type { RootState } from "../../store/store";

import { useSelector } from "react-redux";


export default function TodayGame() {
  const [game, setGame] = useState<TodayGameRes | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsRes | null>(null); // ✅ 통계 상태
  const remain = gameCountdown();
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    getToday()
      .then((res) => {
        setGame(res);
        if (res) {
          getStats(res.gameId).then(setStats).catch(console.error);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleVote = async (option: "A" | "B") => {
    if (!game || game.myVote) return;
    try {
      await postVote(game.gameId, option);

      // 프론트에서 즉시 반영
      const updated = {
        ...game,
        myVote: option,
        options: game.options.map((o) =>
          o.label === option ? { ...o, votes: o.votes + 1 } : o
        ),
      };
      setGame(updated);

      // ✅ 투표 후 최신 통계 가져오기
      const latest = await getStats(game.gameId);
      setStats(latest);

    } catch (e: any) {
      if (e?.response?.status === 409) {
        alert("이미 투표했습니다.");
      } else {
        alert("투표 중 오류 발생");
      }
    }
  };

  const totals = useMemo(() => {
    if (!game) return { total: 0, pctA: 0, pctB: 0 };
    const aVotes = Number(game.options.find((o) => o.label === "A")?.votes) || 0;
    const bVotes = Number(game.options.find((o) => o.label === "B")?.votes) || 0;
    const total = aVotes + bVotes;
    const pctA = total > 0 ? Math.round((aVotes / total) * 100) : 0;
    const pctB = total > 0 ? 100 - pctA : 0;
    return { total, pctA, pctB };
  }, [game]);

  // ✅ MBTI 도넛 데이터
  const pieA = useMemo(() => {
    const m = stats?.mbti?.A || {};
    return Object.entries(m).map(([code, v]) => ({ label: code, value: v.cnt }));
  }, [stats]);

  const pieB = useMemo(() => {
    const m = stats?.mbti?.B || {};
    return Object.entries(m).map(([code, v]) => ({ label: code, value: v.cnt }));
  }, [stats]);

  if (loading) return <div>로딩중...</div>;
  if (!game) return <div>오늘의 밸런스 게임이 없습니다</div>;

  return (
    <main className={styles.main}>
      <h1 className={styles.h1}>오늘의 밸런스 게임</h1>
      <p className={styles.subtitle}>단 하나만 고를 수 있다면?</p>
      <p className={styles.until}>종료까지 {remain} 남음</p>


      <section className={styles.game}>
        <p className={styles.question}>{game.title}</p>
        <div className={styles.grid}>
          {game.options.map((o) => (
            <article
              key={o.label}
              className={`${styles.option} ${game.myVote === o.label ? styles.selected : ""}`}
            >
              <div className={styles.optHead}>
                <div className={styles.optBadge}>{o.label}</div>
                <h3 className={styles.optTitle}>{o.textContent}</h3>
              </div>

              {!game.myVote && (
                <button
                  className={styles.voteBtn}
                  onClick={() => handleVote(o.label)}
                >
                  투표하기
                </button>
              )}



              {/* ✅ 투표 완료 후, 카드 안에서 MBTI 도넛 표시 */}
              {game.myVote && stats && (
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
              )}
              {game.myVote && (
                <div
                  className={styles.result}
                  style={{ ["--pct" as any]: o.label === "A" ? totals.pctA : totals.pctB }}
                >
                  <div className={styles.resultTop}>
                    <strong>{(o.label === "A" ? totals.pctA : totals.pctB) ?? 0}%</strong>
                    <span>{Number(o.votes) || 0}표</span>
                  </div>
                  <div className={styles.bar}></div>
                </div>
              )}
            </article>
          ))}
        </div>



        {game.myVote && (
          <p className={styles.total}>
            총 <strong>{totals.total}</strong>명 참여
          </p>
        )}
        <Link to="/balanceList" className={styles.back}>
          ← 목록으로
        </Link>
      </section>

      {/* ✅ 댓글 컴포넌트 추가 */}
      {game.myVote && (
       <BalGameComment balId={game.gameId} currentUserId={user?.userId ?? 0} variant="today" />
      )}

    </main>
  );
}
