import { useEffect, useState } from "react";
import { getComments, postComment, deleteComment } from "../../api/BalGameCommentApi";
import todayStyles from "./TodayCommentSection.module.css";
import pastStyles from "./PastComment.module.css";

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
    </div>
  );
}
