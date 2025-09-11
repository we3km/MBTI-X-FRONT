import { useState, useEffect } from "react";
import styles from "./Board.module.css";
import { api } from "../../api/boardApi";
import { initBoard, type Board } from "../../type/board";
import { useParams, useNavigate } from "react-router-dom";

// 댓글 타입
type Comment = {
  id?: number;
  boardId: string | undefined;
  nickname: string;
  content: string;
  createdAt?: string;
  parentId?: number | null;
};

export default function Detail() {
  const [nickname, setNickname] = useState("익명");
  const [board, setBoard] = useState<Board>(initBoard);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);

  const [showReport, setShowReport] = useState(false);
  const [reportType, setReportType] = useState("욕설");
  const [reportContent, setReportContent] = useState("");

  // 대댓글 상태
  const [replyTarget, setReplyTarget] = useState<number | null>(null);
  const [replyInput, setReplyInput] = useState("");

  const param = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // 게시글 불러오기
    api.get("/board/" + param.id)
      .then(res => setBoard(res.data))
      .catch(err => console.log(err));

    // 닉네임 세팅
    const savedNickname = localStorage.getItem("nickname") || "익명";
    setNickname(savedNickname);

    // 댓글 불러오기
    api.get("/board/" + param.id + "/comments")
      .then(res => {
        if (Array.isArray(res.data)) {
          setComments(res.data);
        } else if (res.data.comments) {
          setComments(res.data.comments);
        } else {
          setComments([]);
        }
      })
      .catch(err => console.log(err));
  }, [param.id]);

  // 일반 댓글 저장
  const saveComment = async () => {
    if (!commentInput.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }
    try {
      const newComment: Comment = {
        content: commentInput,
        boardId: param.id,
        nickname,
        createdAt: new Date().toISOString(),
        parentId: null
      };
      const res = await api.post("/board/comments", newComment);
      setComments([...comments, res.data || newComment]);
      setCommentInput("");
    } catch (err) {
      console.error(err);
      alert("댓글 작성 실패");
    }
  };

  // 대댓글 저장
  const saveReply = async (parentId: number) => {
    if (!replyInput.trim()) {
      alert("대댓글 내용을 입력해주세요.");
      return;
    }
    try {
      const newReply: Comment = {
        content: replyInput,
        boardId: param.id,
        nickname,
        createdAt: new Date().toISOString(),
        parentId
      };
      const res = await api.post("/board/comments", newReply);
      setComments([...comments, res.data || newReply]);
      setReplyInput("");
      setReplyTarget(null);
    } catch (err) {
      console.error(err);
      alert("대댓글 작성 실패");
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
              <a href="/Mbti">전용 게시판</a>
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
        {/* 제목 + 메타정보 */}
        <div className={styles.postHeader}>
          <h2 className={styles.postTitle}>{board.title}</h2>
          <div className={styles.postMeta}>
            <span>{board.nickname}</span> |
            <span>{board.createdAt}</span> |
            <span>조회수 {board.view}</span>
          </div>
        </div>

        {/* 본문 + 이미지 */}
        <div className={styles.postContent}>
          {board.content}

          {board.images && board.images.length > 0 && (
            <div className={styles.imageList}>
              {board.images.map((img: string, idx: number) => (
                <img
                  key={idx}
                  src={`http://localhost:8085/api/uploads/${img}`}
                  alt={`첨부이미지-${idx}`}
                  className={styles.postImage}
                />
              ))}
            </div>
          )}
        </div>

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
          {comments
            .filter(c => !c.parentId)
            .map((cmt, idx) => (
              <div key={idx} className={styles.commentItem}>
                <div className={styles.commentMain}>
                  <div>
                    <strong>{cmt.nickname}</strong>: {cmt.content}
                  </div>
                  <div className={styles.commentActions}>
                    <button onClick={() => alert("신고 버튼 클릭됨")}>🚨 신고</button>
                    <button onClick={() => setReplyTarget(cmt.id || null)}>💬 대댓글</button>
                  </div>
                </div>
                <div className={styles.commentDate}>
                  {cmt.createdAt ? new Date(cmt.createdAt).toLocaleString() : ""}
                </div>

                {/* 대댓글 입력창 */}
                {replyTarget === cmt.id && (
                  <div className={styles.replyInputWrapper}>
                    <textarea
                      placeholder="대댓글을 입력하세요"
                      value={replyInput}
                      onChange={(e) => setReplyInput(e.target.value)}
                    />
                    <button onClick={() => saveReply(cmt.id!)}>대댓글 작성</button>
                  </div>
                )}

                {/* 대댓글 리스트 */}
                <div className={styles.replyList}>
                  {comments
                    .filter(r => r.parentId === cmt.id)
                    .map((reply, rIdx) => (
                      <div key={rIdx} className={styles.replyItem}>
                        <div className={styles.commentMain}>
                          <div>
                            <strong>{reply.nickname}</strong>: {reply.content}
                          </div>
                          <div className={styles.commentActions}>
                            <button onClick={() => alert("신고 버튼 클릭됨")}>🚨 신고</button>
                          </div>
                        </div>
                        <div className={styles.commentDate}>
                          {reply.createdAt ? new Date(reply.createdAt).toLocaleString() : ""}
                        </div>
                      </div>
                    ))}
                </div>
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
              <option value="1">욕설</option>
              <option value="2">도배</option>
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
