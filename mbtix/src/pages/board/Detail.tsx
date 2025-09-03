import { useState, useEffect } from "react";
import styles from "./Board.module.css";
import { api } from "../../api/boardApi";
import { initBoard, type Board } from "../../type/board";
import { useParams, useNavigate } from "react-router-dom";

export default function Detail() {
  const [nickname, setNickname] = useState("익명");
  const [board, setBoard] = useState<Board>(initBoard);  
  const [comments, setComments] = useState<{ nickname: string; content: string }[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);

  const [showReport, setShowReport] = useState(false);
  const [reportType, setReportType] = useState("욕설");
  const [reportContent, setReportContent] = useState("");

  const param = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/board/" + param.id)
      .then(res => setBoard(res.data))
      .catch(err => console.log(err));

    const savedNickname = localStorage.getItem("nickname") || "익명";
    setNickname(savedNickname);

    api.get("/board/" + param.id + "/comments")
      .then(res => setComments(res.data))
      .catch(err => console.log(err));
  }, []);

  const saveComment = async () => {
    if (!commentInput.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }
    try {
      const newComment = { nickname, content: commentInput };
      await api.post("/board/" + param.id + "/comments", newComment);
      setComments([...comments, newComment]);
      setCommentInput("");
    } catch (err) {
      console.error(err);
      alert("댓글 작성 실패");
    }
  };

  const submitReport = () => {
    if (!reportContent.trim()) {
      alert("신고 내용을 입력해주세요.");
      return;
    }
    api.post("/report", {
      reportedUser: board.nickname,
      type: reportType,
      content: reportContent,
      postId: null
    })
    .then(() => {
      alert("신고가 접수되었습니다.");
      setShowReport(false);
      setReportContent("");
    })
    .catch(err => {
      console.error(err);
      alert("신고 접수 실패");
    });
  };

  return (
    <div className={styles.wrapper}>
      {/* 헤더 */}
      <div className={styles.header}>
        <div className={styles["header-left"]}>MBTI-X</div>
        <div className={styles["header-center"]}>
          <div className={styles.dropdown}>
            <a href="/board">게시판 ▼</a>
            <div className={styles["dropdown-content"]}>
              <a href="/board">통합 게시판</a>
              <a href="Mbti">전용 게시판</a>
            </div>
          </div>
          <a href="/question">궁금해 게시판</a>
          <a href="#">미니게임</a>
          <a href="#">MBTI 챗봇</a>
        </div>
        <div className={styles["header-right"]}>
          <span className={styles.nickname}>{nickname}</span>
        </div>
      </div>

      <main className={styles.content}>
        {/* 제목과 정보 */}
        <h1 className={styles.postTitle}>{board.title}</h1>
        <div className={styles.postInfo}>{board.nickname}</div>
        <div className={styles.postContent}>{board.content}</div>

        {/* 버튼 영역 */}
        <div className={styles.buttonRow}>
          <div className={styles.centerButtons}>
            <button onClick={() => navigate("/board")}>목록으로</button>
            <button id="deleteBtn">삭제</button>
          </div>
          <div className={styles.rightButtons}>
            <button className={styles.reportBtn} onClick={() => setShowReport(true)}>
              🚨 신고
            </button>
          </div>
        </div>

        {/* 좋아요 / 싫어요 */}
        <div className={styles.likeSection}>
          <button onClick={() => setLikes(likes + 1)}>👍 좋아요 {likes}</button>
          <button onClick={() => setDislikes(dislikes + 1)}>👎 싫어요 {dislikes}</button>
        </div>

        {/* 댓글 입력 */}
        <div className={styles.commentSection}>
          <h3>댓글 작성</h3>
          <div className={styles.commentInputWrapper}>
            <textarea
              placeholder="댓글을 입력하세요"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
            />
            <button onClick={saveComment}>댓글 작성</button>
          </div>
        </div>

        {/* 댓글 리스트 */}
        <div className={styles.commentList}>
          <h3>댓글 목록</h3>
          {comments.length === 0 && <p>댓글이 없습니다.</p>}
          {comments.map((cmt, idx) => (
            <div key={idx} className={styles.commentItem}>
              <strong>{cmt.nickname}</strong>: {cmt.content}
            </div>
          ))}
        </div>
      </main>

      {/* 신고 모달 */}
      {showReport && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>🚨 신고하기</h2>
            <p><b>신고 회원:</b> <u>{board.nickname}</u></p>

            <label>신고 유형:</label>
            <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
              <option value="욕설">욕설</option>
              <option value="도배">도배</option>
            </select>

            <label>신고 내용:</label>
            <textarea
              className={styles.reportTextarea}
              placeholder="신고 내용을 입력하세요"
              value={reportContent}
              onChange={(e) => setReportContent(e.target.value)}
            />

            <div className={styles.modalButtons}>
              <button onClick={submitReport}>제출</button>
              <button onClick={() => setShowReport(false)}>취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
