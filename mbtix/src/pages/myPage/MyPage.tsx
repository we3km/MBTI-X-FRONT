import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import styles from "./MyPage.module.css";
import { useEffect, useState } from "react";
import Modal from "../../components/FindModal";
import ChangeNick from "./ChangeNick";
import ChangePw from "./ChangePw";
import ChangeProfileImg from "./ChangeImg";
import { getBoard, getScores } from "../../api/mypageApi";
import ChangeMbti from "./ChangeMbti";
import { useNavigate } from "react-router-dom";

export default function MyPage() {
  const user = useSelector((state: RootState) => state.auth.user);

  const navigate = useNavigate();

  const [shwoChangeNick , setShowChangeNick] = useState(false);
  const [shwoChangePw , setShowChangePW] = useState(false);
  const [showChangeImg, setSwowChangeImg] = useState(false);
  const [showChangeMbti, setShowChangeMbti] = useState(false);

  const [boards, setBoards] = useState<{ boardId : number, boardTitle: string; nickName: string; createdAt: string; viewCount: number }[]>([]);

  const [scores, setScores] = useState<{quizScore: number, findDiffScore: number, reactionScore: number} | null>(null);

useEffect(() => {
  if (user?.userId) {
    getScores(user.userId).then(setScores);
    getBoard(user.userId).then(setBoards);
  }
}, [user?.userId]);

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
        <div
          className={styles.profileOverlay}
          onClick={() => setSwowChangeImg(true)}
        >
          이미지 수정
        </div>
      </div>

      <div className={styles.editBtnGroup}>
        <button
          className={styles.editBtn}
          onClick={() => setShowChangeNick(true)}
        >
          닉네임 변경
        </button>
        <button
          className={styles.editBtn}
          onClick={() => setShowChangePW(true)}
        >
          비밀번호 변경
        </button>
      </div>

      <div className={styles.mbtiCard}>
        <h3>나의 MBTI</h3>
        <p className={styles.mbtiValue}>{user?.mbtiName || "INTJ"}</p>
        <button className={styles.smallBtn} onClick={()=> setShowChangeMbti(true)}>MBTI 재검사</button>
        <button className={styles.smallBtn} onClick={()=> navigate("/balance/today")}>밸런스 게임 의견</button>
      </div>
    </aside>

    {/* 우측 메인 */}
    <main className={styles.main}>
      <section className={styles.accountBox}>
        <p>
          <strong>닉네임</strong> {user?.nickname}
        </p>
        <p>
          <strong>이메일</strong> {user?.email}
        </p>
        <p>
          <strong>내 포인트</strong> {user?.point}
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
         {/* 게시글 (메인 맨 하단) */}
      <section className={styles.postsSection}>
        <h3>게시글 목록</h3>
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

    {/* 모달들 */}
    {shwoChangeNick && (
      <Modal onClose={() => setShowChangeNick(false)}>
        <ChangeNick />
      </Modal>
    )}
    {shwoChangePw && (
      <Modal onClose={() => setShowChangePW(false)}>
        <ChangePw />
      </Modal>
    )}
    {showChangeImg && (
      <Modal onClose={() => setSwowChangeImg(false)}>
        <ChangeProfileImg />
      </Modal>
    )}
    {showChangeMbti && (
      <Modal onClose={()=> setShowChangeMbti(false)}>
          <ChangeMbti onClose={() => setShowChangeMbti(false)}/>
      </Modal>
    )}
  </div>
);

}
