import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import styles from "./MyPage.module.css";
import { useState } from "react";
import Modal from "../login/FindModal";
import ChangeNick from "./changeNick";
import ChangePw from "./changePw";

export default function MyPage() {
  const user = useSelector((state: RootState) => state.auth.user);

  const [shwoChangeNick , setShowChangeNick] = useState(false);
  const [shwoChangePw , setShowChangePW] = useState(false);

  return (
    <div className={styles.container}>
      {/* 좌측 사이드 */}
      <aside className={styles.sidebar}>
        <img
          src={`/profile/default/${user?.profileFileName || "default.jpg"}`}
          alt="프로필"
          className={styles.profileImg}
        />
        <div className={styles.editBtnGroup}>
            <button className={styles.editBtn} onClick={() => setShowChangeNick(true)}>닉네임 변경</button>
            <button className={styles.editBtn} onClick={() => setShowChangePW(true)}>비밀번호 변경</button>
        </div>

        <div className={styles.mbtiCard}>
          <h3>나의 MBTI</h3>
          <p className={styles.mbtiValue}>{user?.mbtiName || "INTJ"}</p>
          <button className={styles.smallBtn}>MBTI 재검사</button>
          <button className={styles.smallBtn}>밸런스 게임 의견</button>
        </div>
      </aside>

      {/* 우측 메인 */}
      <main className={styles.main}>
        <section className={styles.accountBox}>
          <p>
            <strong>닉네임</strong> {user?.nickname || "MKM"}
          </p>
          <p>
            <strong>이메일</strong> {user?.email || "mkm@naver.com"}
          </p>
          <p>
            <strong>내 포인트</strong> {user?.point ?? 50000}
          </p>

          <h3 className={styles.gameTitle}>👑 미니 게임 점수 👑</h3>
          <div className={styles.gameScores}>
            <div className={styles.gameCircle}>
              <span>퀴즈</span>
              <strong>60</strong>
            </div>
            <div className={styles.gameCircle}>
              <span>틀린그림찾기</span>
              <strong>100</strong>
            </div>
            <div className={styles.gameCircle}>
              <span>순발력</span>
              <strong>10</strong>
            </div>
          </div>
        </section>
      </main>
           {/* 게시글 */}
      <section className={styles.postsSection}>
        <h3>게시글 목록</h3>
        <div className={styles.postItem}>
          <span className={styles.postTitle}>안녕하세요</span>
          <span className={styles.postMeta}>MKM | 2025-04-21 | 조회수: 2</span>
        </div>
      </section>
    {shwoChangeNick && (
        <Modal onClose={() => setShowChangeNick(false)}>
            <ChangeNick/>
        </Modal>
    )}
    {shwoChangePw && (
        <Modal onClose={() => setShowChangePW(false)}>
            <ChangePw/>
        </Modal>
    )}


      
    </div>
  );
}
