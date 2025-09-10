import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { postCreateGame } from "../../api/BalGameApi";
import styles from "./css/CreateBalGame.module.css"

export default function BalanceCreate() {
  const [title, setTitle] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const nav = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await postCreateGame({ title, optionAText: optionA, optionBText: optionB });
      alert(`게임이 생성되었습니다! (ID: ${res.gameId})`);
      nav("/balanceList");
    } catch (err) {
      console.error(err);
      alert("게임 생성 실패 ❌");
    }
  };

   return (
    <div className={styles.container}>
        
      <h2 className={styles.title}>밸런스 게임 생성</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* 제목 */}
        <label className={styles.label}>제목</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={styles.input}
          placeholder="게임 제목 입력"
          required
        />

        {/* 선택지 */}
        <label className={styles.label}>선택지</label>
        <div className={styles.optionWrap}>
          <div className={styles.option}>
            <span className={styles.optLabel}>A</span>
            <input
              type="text"
              value={optionA}
              onChange={(e) => setOptionA(e.target.value)}
              className={styles.input}
              placeholder="옵션 A 입력"
              required
            />
          </div>
          <div className={styles.option}>
            <span className={styles.optLabel}>B</span>
            <input
              type="text"
              value={optionB}
              onChange={(e) => setOptionB(e.target.value)}
              className={styles.input}
              placeholder="옵션 B 입력"
              required
            />
          </div>
        </div>
        

        {/* 버튼 */}
        <div className={styles.btnWrap}>
         <button type="submit" className={styles.goBackBtn} onClick={() => nav("/balanceList")}>
            돌아가기
          </button>

          <button type="submit" className={styles.submitBtn}>
            생성하기
          </button>
        </div>  
        
      </form>
    </div>
  );
}