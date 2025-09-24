import { useEffect, useState } from "react";
import { getComments, postComment, deleteComment } from "../../api/BalGameCommentApi";
import todayStyles from "./TodayCommentSection.module.css";
import pastStyles from "./PastComment.module.css";

// import { api } from "../../api/boardApi";

type Comment = {
  commentId: number;
  balId: number;
  userId: number;
  userName: string;
  mbti: string;
  content: string;
  createAt: string;
};

interface Props {
  balId: number;
  currentUserId: number;
  variant?: "today" | "past";   // ✅ 추가
}

export default function BalGameComment({ balId, currentUserId, variant = "today" }: Props) {
  const styles = variant === "past" ? pastStyles : todayStyles;

  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");

  // // 🚨 신고 상태
  // const [showReport, setShowReport] = useState(false);
  // const [reportType, setReportType] = useState("1");
  // const [reportContent, setReportContent] = useState("");
  // const [targetUserId, setTargetUserId] = useState<number | null>(null);

  const loadComments = () => {
    getComments(balId).then(setComments);
  };

  useEffect(() => {
    loadComments();
  }, [balId]);

  const handleSubmit = () => {
    if (!content.trim()) return;
    postComment(balId, currentUserId, content).then(() => {
      setContent("");
      loadComments();
    });
  };

  const handleDelete = (commentId: number) => {
    deleteComment(commentId, currentUserId)
      .then(() => loadComments())
      .catch(() => alert("삭제 권한이 없습니다."));
  };

  //  // 🚨 신고 제출
  // const submitReport = () => {
  //   if (!reportContent.trim()) {
  //     alert("신고 내용을 입력해주세요.");
  //     return;
  //   }
  //   api
  //     .post("/balance/report", {
  //       reason: reportContent,
  //       reportCategory: reportType,
  //       targetUserId,
  //       balId,
  //     })
  //     .then(() => {
  //       alert("신고가 접수되었습니다.");
  //       setShowReport(false);
  //       setReportContent("");
  //     })
  //     .catch((err) => {
  //       console.error(err);
  //       alert("신고 접수 실패");
  //     });
  // };

  return (
    <div className={styles.commentBox}>
      <h3 className={styles.commentTitle}>댓글</h3>

      <div className={styles.commentForm}>
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="댓글을 입력하세요"
        />
        <button onClick={handleSubmit}>등록</button>
      </div>

      <ul className={styles.commentList}>
        {comments.map((c) => (
          <li key={c.commentId} className={styles.commentItem}>
            <div className={styles.commentHeader}>
              <span className={styles.commentUser}>
                {c.userName} ({c.mbti})
              </span>
              {/* 🚨 신고 버튼
              <button
                onClick={() => {
                  setShowReport(true);
                  setTargetUserId(c.userId);
                }}
              >
                🚨 신고
              </button> */}


              <span>{c.createAt}</span>
            </div>
            <div className={styles.commentContent}>{c.content}</div>
            {c.userId === currentUserId && (
              <button
                className={styles.deleteBtn}
                onClick={() => handleDelete(c.commentId)}
              >
                삭제
              </button>
            )}
          </li>
        ))}

      </ul>
      {/* 🚨 신고 모달
      {showReport && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>🚨 댓글 신고하기</h2>

            <label>신고 유형:</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="1">욕설</option>
              <option value="2">도배</option>
              <option value="3">기타</option>
            </select>

            <label>신고 내용:</label>
            <textarea
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
      )} */}
    </div>
  );
}
