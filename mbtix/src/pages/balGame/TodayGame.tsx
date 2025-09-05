// src/pages/TodayGame.tsx (또는 그냥 src/TodayGame.tsx)
import { useEffect, useState, useMemo } from "react";
import http from "../../api/BalGameApi"
import styles from "./TodayGame.module.css"; // CSS는 나중에 적용


type Option = { label: "A"|"B"; title: string; votes: number };

export default function TodayGame(){
  const [title, setTitle] = useState("");
  const [options, setOptions] = useState<[Option, Option]>([
    {label:"A", title:"", votes:0},
    {label:"B", title:"", votes:0}
  ]);
  const [picked, setPicked] = useState<"A"|"B"|null>(null);
  const [gameId, setGameId] = useState<number|null>(null);
  const [loading, setLoading] = useState(true);

  // 오늘의 게임 불러오기
  useEffect(()=>{
    (async ()=>{
      try {
        const r = await http.get("/balance/today");
        if (r.status === 200){
          setGameId(r.data.gameId);
          setTitle(r.data.title);
          setOptions([r.data.options[0], r.data.options[1]]);
          setPicked(r.data.myVote);
        }
      } catch(e){
        console.error("API 오류:", e);
      } finally {
        setLoading(false);
      }
    })();
  },[]);

  // 투표
  const handleVote = async (label:"A"|"B")=>{
    if (!gameId || picked) return;
    try {
      await http.post(`/balance/${gameId}/vote`, { option: label });
      // 투표 후 바로 UI 반영
      const idx = label==="A" ? 0 : 1;
      const next = [...options] as [Option, Option];
      next[idx] = { ...next[idx], votes: next[idx].votes + 1 };
      setOptions(next);
      setPicked(label);
    } catch (e:any){
      if (e?.response?.status === 409) {
        alert("이미 투표했습니다.");
      } else {
        alert("투표 중 오류 발생");
      }
    }
  };

  // 총합 계산
  const totals = useMemo(()=>{
    const total = options[0].votes + options[1].votes;
    const pctA = total ? Math.round((options[0].votes/total)*100) : 0;
    const pctB = 100 - pctA;
    return { total, pctA, pctB };
  },[options]);

  if (loading) return <div>로딩중...</div>;
  if (!gameId) return <div>오늘의 밸런스 게임이 없습니다</div>;

  return (
    <main className={styles.main}>
      <h1 className={styles.h1}>오늘의 밸런스 게임</h1>
      <p className={styles.subtitle}>단 하나만 고를 수 있다면?</p>

      <section className={styles.game}>
        <p className={styles.question}>{title}</p>
        <div className={styles.grid}>
          {options.map(o=>(
            <article key={o.label} className={`${styles.option} ${picked===o.label?styles.selected:""}`}>
              <div className={styles.optHead}>
                <div className={styles.optBadge}>{o.label}</div>
                <h3 className={styles.optTitle}>{o.title}</h3>
              </div>
              <button disabled={!!picked} onClick={()=>handleVote(o.label)}>투표하기</button>
              {(picked!==null) && (
                <div className={styles.result} style={{ ["--pct" as any]: o.label==="A"?totals.pctA:totals.pctB }}>
                  <div className={styles.resultTop}>
                    <strong>{o.label==="A"?totals.pctA:totals.pctB}%</strong>
                    <span>{o.votes}표</span>
                  </div>
                  <div className={styles.bar}><i/></div>
                </div>
              )}
            </article>
          ))}
        </div>
        {picked && <p className={styles.total}>총 <strong>{totals.total}</strong>명 참여</p>}
      </section>
    </main>
  );
}
