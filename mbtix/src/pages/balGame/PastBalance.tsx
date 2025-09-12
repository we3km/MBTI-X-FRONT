import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getStats, type StatsRes } from "../../api/BalGameApi";
import styles from "./css/PastBalance.module.css";
import { Donut, MBTI_COLORS } from "../../components/balGame/Donut";
import BalGameComment from "../BalGameComment/BalGameComment";
import type { RootState } from "../../store/store";
import { useSelector } from "react-redux";



export default function PastBalance() {
  const { gameId } = useParams<{ gameId: string }>();
  const [stats, setStats] = useState<StatsRes | null>(null);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (!gameId) return;
    const id = Number(gameId);
    if (Number.isNaN(id)) {
      console.error("잘못된 gameId:", gameId);
      return;
    }
    getStats(id).then(setStats).catch(console.error);
  }, [gameId]);

  const rows = useMemo(() => {
    if (!stats) return [];
    const keys = ["A", "B"];
    return keys.map((k) => ({
      label: k,
      cnt: stats.options[k]?.cnt ?? 0,
      ratio: Math.round(stats.options[k]?.ratio ?? 0),
    }));
  }, [stats]);

  // ✅ MBTI 도넛 데이터 가공
  const pieA = useMemo(() => {
    const m = stats?.mbti?.A || {};
    return Object.entries(m).map(([code, v]) => ({ label: code, value: v.cnt }));
  }, [stats]);

  const pieB = useMemo(() => {
    const m = stats?.mbti?.B || {};
    return Object.entries(m).map(([code, v]) => ({ label: code, value: v.cnt }));
  }, [stats]);

  if (!stats) return <div>결과 불러오는 중...</div>;

  return (
    <main className={styles.main}>
      <div className={styles.head}>
        <h1>결과 보기</h1>
        <Link to="/balanceList" className={styles.back}>
          ← 목록으로
        </Link>
      </div>

      <section className={styles.panel}>
        <p className={styles.subtitle}>총 {stats.totalVotes}명 참여</p>

        {/* ✅ MBTI 도넛 */}
        <div className={styles.donuts}>
          <div className={styles.donutBox}>
            <Donut data={pieA} />
            <div className={styles.legend}>
              {pieA.map((d) => {
                const color = MBTI_COLORS[d.label] || "#ADB5BD";
                return (
                  <div key={d.label} style={{ color }}>
                    ■ {d.label} {d.value}표
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.donutBox}>
            <Donut data={pieB} />
            <div className={styles.legend}>
              {pieB.map((d) => {
                const color = MBTI_COLORS[d.label] || "#ADB5BD";
                return (
                  <div key={d.label} style={{ color }}>
                    ■ {d.label} {d.value}표
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ✅ 기존 A/B 비율 막대 */}
        <div className={styles.grid}>
          {rows.map((r) => (
            <article key={r.label} className={styles.card}>
              <div className={styles.badge}>{r.label}</div>

              <div className={styles.countLine}>
                <strong>{r.ratio}%</strong>
                <span>{r.cnt}표</span>
              </div>
              <div className={styles.barWrap}>
                <div className={styles.barFill} style={{ width: `${r.ratio}%` }} />
              </div>
            </article>
          ))}
        </div>
      </section>
      {/* ✅ 댓글 컴포넌트 추가 */}
      <div className={styles.commentSection}>
      <BalGameComment balId={Number(gameId)} currentUserId={user?.userId ?? 0} variant="past" />
      </div>
    </main>
  );
}