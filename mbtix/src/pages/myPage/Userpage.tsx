// src/pages/mypage/UserPage.tsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import styles from "./MyPage.module.css";
import { getUserProfile, getUserScores, getUserBoards } from "../../api/mypageApi";

export default function UserPage() {
  const { userId } = useParams<{ userId: string }>();

  const [user, setUser] = useState<any>(null);
  const [boards, setBoards] = useState<
    { boardId: number; boardTitle: string; nickName: string; createdAt: string; viewCount: number }[]
  >([]);
  const [scores, setScores] = useState<{ quizScore: number; findDiffScore: number; reactionScore: number } | null>(null);

  useEffect(() => {
    if (userId) {
      getUserProfile(Number(userId)).then(setUser);
      getUserScores(Number(userId)).then(setScores);
      getUserBoards(Number(userId)).then(setBoards);
    }
  }, [userId]);

  return (
    <div className={styles.container}>
      {/* 좌측 사이드 */}
      <aside className={styles.sidebar}>
        <div className={styles.profileWrapper}>
          <img
            src={
              user?.profileType === "UPLOAD"
                ? `http://localhost:8085/api/mypage/profile/images/${user?.profileFileName}`
                : `/profile/default/${user?.profileFileName || "default.jpg"}`
            }
            alt="프로필"
            className={styles.profileImg}
          />
        </div>

        <div className={styles.mbtiCard}>
          <h3>{user?.nickname}님의 MBTI</h3>
          <p className={styles.mbtiValue}>{user?.mbtiName || "정보 없음"}</p>
        </div>
      </aside>

      {/* 우측 메인 */}
      <main className={styles.main}>
        <section className={styles.accountBox}>
          <p>
            <strong>닉네임</strong> {user?.nickname}
          </p>
          <p>
            <strong>포인트</strong> {user?.point}
          </p>
        </section>

        <section className={styles.scoreBox}>
          <h3 className={styles.gameTitle}>👑 미니 게임 점수 👑</h3>
          <div className={styles.gameScores}>
            <div className={styles.gameCircle}>
              <span>스피드 퀴즈</span>
              <strong>{scores?.quizScore ?? 0}</strong>
            </div>
            <div className={styles.gameCircle}>
              <span>캐치마인드</span>
              <strong>{scores?.findDiffScore ?? 0}</strong>
            </div>
            <div className={styles.gameCircle}>
              <span>순발력 테스트</span>
              <strong>{scores?.reactionScore ?? 0}</strong>
            </div>
          </div>
        </section>
      </main>

      {/* 게시글 목록 */}
      <section className={styles.postsSection}>
        <h3>작성한 게시글</h3>
        {boards.length > 0 ? (
          boards.map((board) => (
            <div key={board.boardId} className={styles.postItem}>
              <span className={styles.postTitle}>{board.boardTitle}</span>
              <span className={styles.postMeta}>
                {board.nickName} | {board.createdAt} | {board.viewCount}
              </span>
            </div>
          ))
        ) : (
          <p>게시글이 없습니다.</p>
        )}
      </section>
    </div>
  );
}
