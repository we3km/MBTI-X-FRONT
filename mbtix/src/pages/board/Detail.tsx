import { useState, useEffect } from "react";
import styles from "./Board.module.css";
import { api } from "../../api/boardApi";
import { initBoard, type Board } from "../../type/board";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import toast from "react-hot-toast";

// 댓글 타입
type Comment = {
  commentId?: number;
  boardId: string | undefined;
  nickname: string;
  content: string;
  createdAt?: string;
  parentId?: number | null;
  userId: number;
};

export default function Detail() {
  const [board, setBoard] = useState<Board>(initBoard);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [targetUserNum, setTargetUserNum] = useState(0);

  const [showReport, setShowReport] = useState(false);
  const [reportType, setReportType] = useState("1");
  const [reportContent, setReportContent] = useState("");
  const [targetNickname, setTargetNickname] = useState("");

  const [reportTarget, setReportTarget] = useState<{ boardId: number | null, commentId: number | null }>({ boardId: null, commentId: null });

  // 대댓글 상태 (한번에 하나만 열리도록)
  const [replyTarget, setReplyTarget] = useState<number | null>(null);
  const [replyInput, setReplyInput] = useState("");

  // 대댓글 보기 토글 상태
  const [openReplies, setOpenReplies] = useState<{ [key: number]: boolean }>({});

  const nickname = useSelector((state: RootState) => state.auth.user?.nickname) || "익명";
  const loginUserId = useSelector((state: RootState) => state.auth.user?.userId);
  const userMbti = useSelector((state:RootState) => state.auth.user?.mbtiId);

  const [searchParams] = useSearchParams();

  // 'id' 파라미터의 값 가져오기
  const categoryId = searchParams.get('categoryId'); 

  const param = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // 게시글 불러오기
    getBoard();
    // 댓글 불러오기
    getComments();

    if (window.location.hash) {
        const commentId = window.location.hash.replace('#', '');
        const commentElement = document.getElementById(commentId);
        if (commentElement) {
            commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
  }, [param.id]);
  
  const getBoard = () => {
    api
      .get("/board/" + param.id)
      .then((res) => {
        setBoard(res.data)
      })
      .catch((err) => console.log(err));
  }

  const getComments = () => {
    api
      .get("/board/" + param.id + "/comments")
      .then((res) => {
        console.log(res.data)
        if (Array.isArray(res.data)) {
          setComments(res.data);
        } else if (res.data.comments) {
          setComments(res.data.comments);
        } else {
          setComments([]);
        }
      })
      .catch((err) => console.log(err));
  }

  // 게시글 삭제
  const handleDeletePost = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/board/${param.id}`);
      toast.success("삭제되었습니다.");
      navigate("/board");
    } catch (err) {
      console.error(err);
      toast.error("삭제 실패");
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/board/comments/${commentId}`);
      getComments();
      //setComments(comments.filter((c) => c.commentId !== commentId));
    } catch (err) {
      console.error(err);
      toast.error("댓글 삭제에 실패했습니다.");
    }
  };

  // 일반 댓글 저장
  const saveComment = async () => {
    if (!commentInput.trim()) {
      toast.error("댓글 내용을 입력해주세요.");
      return;
    }

    // 궁급해 게시판의 경우
    // 게시글의 mbtiname과 질문자의 mbtiname이 일치하는 경우만 댓글작성가능

    if(categoryId == '1' && userMbti != board.mbtiId ){
        toast.error(`${board.mbtiName}만 달 수 있는 댓글입니다.`);
        return;
    }

    try {
      const newComment: Omit<Comment, "userId"> = {
        content: commentInput,
        boardId: param.id,
        nickname,
        createdAt: new Date().toISOString(),
        parentId: null,
      };
      const res = await api.post("/board/comments", newComment);
      getComments();          

      setCommentInput("");
    } catch (err) {
      console.error(err);
      toast.error("댓글 작성에 실패했습니다.");
    }
  };

  // 대댓글 저장
  const saveReply = async (parentId: number) => {
    if (!replyInput.trim()) {
      toast.error("대댓글 내용을 입력해주세요.");
      return;
    }

    if(categoryId == '1' && userMbti != board.mbtiId ){
        toast.error(`${board.mbtiName}만 달 수 있는 댓글입니다.`);
        return;
    }
    
    try {
      const newReply: Omit<Comment, "userId"> = {
        content: replyInput,
        boardId: param.id,
        nickname,
        createdAt: new Date().toISOString(),
        parentId,
      };
      const res = await api.post("/board/comments", newReply);
      getComments();    

      setReplyInput("");
      setReplyTarget(null);
    } catch (err) {
      console.error(err);
      toast.error("대댓글 작성에 실패했습니다.");
    }
  };

  // 신고 제출
  const submitReport = () => {
    if (!reportContent.trim()) {
      toast.error("신고 내용을 입력해주세요.");
      return;
    }
    api
      .post("/board/report", {
        reson: reportContent,
        reportCategory: reportType,
        targetUserNum,
        boardId: reportTarget.boardId,
        commentId: reportTarget.commentId,
      })
      .then(() => {
        toast.success("신고가 접수되었습니다.");
        setShowReport(false);
        setReportContent("");
      })
      .catch((err) => {
        console.error(err);
        toast.error("신고 접수 실패");
      });
  };

  const handleLike = (status:string) => {
    api
      .post("/board/boardLike/"+param.id, {
        status ,
      })
      .then(() => {
        getBoard()
        //setLikes(prev => prev+1);
      })
      .catch((err) => {
        console.error(err);
        toast.error("좋아요 실패");
      });
  }

  return (
    <div className={styles.wrapper}>
      <main className={styles.content}>
        {/* 제목 + 메타정보 */}
        <div className={styles.postHeader}>
          <h2 className={styles.postTitle}>{board.title}</h2>
          <div className={styles.postMeta}>
            <span>{board.nickname}</span> | <span>{board.createdAt}</span> |{" "}
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

            {/* 본인일 때만 삭제 버튼 */}
            {board.userId === loginUserId && (
              <button onClick={handleDeletePost}>삭제</button>
            )}
          </div>
          <div className={styles.rightButtons}>
            <button
              className={styles.reportBtn}
              onClick={() => {
                setShowReport(true);
                setTargetUserNum(board.userId);
                setTargetNickname(board.nickname);
                setReportTarget({ boardId: board.boardId, commentId: null });
              }}
            >
              🚨 신고
            </button>
          </div>
        </div>

        {/* 좋아요 / 싫어요 */}
        <div className={styles.likeSection}>
          <button onClick={() => handleLike('1')}>👍 좋아요 {board.likeCount ?? 0}</button>
          <button onClick={() => handleLike('2')}>
            👎 싫어요 {board.dislikeCount ?? 0}
          </button>
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
            .filter((c) => !c.parentId)
            .map((cmt, idx) => {
              console.log(cmt , comments)
              const replyCount = comments.filter((r) => r.parentId === cmt.commentId).length;
              return (
              <div key={idx} className={styles.commentItem}>
                <div className={styles.commentMain}>
                  <div>
                    <strong className={styles.commentNickname}  onClick={() => navigate (`/user/${cmt.userId}`)}>{cmt.nickname}</strong>: {cmt.content}
                    {/* 대댓글 개수 표시 */}
                    {replyCount > 0 && (
                      <span className={styles.replyCount}> ({replyCount}개의 대댓글)</span>
                    )}
                  </div>
                  <div className={styles.commentActions}>
                    <button
                      onClick={() => {
                        setShowReport(true);
                        setTargetUserNum(cmt.userId);
                        setTargetNickname(cmt.nickname);
                        setReportTarget({ boardId: board.boardId, commentId: cmt.commentId || null });
                      }}
                    >
                      🚨 신고
                    </button>

                    {/* 본인 댓글일 때만 삭제 버튼 */}
                    {cmt.userId === loginUserId && (
                      <button onClick={() => handleDeleteComment(cmt.commentId!)}>
                        ❌ 삭제
                      </button>
                    )}

                    <button
                      onClick={() => setReplyTarget(cmt.commentId || null)}
                    >
                      💬 대댓글
                    </button>
                    <button
                      onClick={() =>
                        setOpenReplies((prev) => ({
                          ...prev,
                          [cmt.commentId!]: !prev[cmt.commentId!],
                        }))
                      }
                    >
                      {openReplies[cmt.commentId!]
                        ? "대댓글 숨기기"
                        : "대댓글 보기"}
                    </button>
                  </div>
                </div>
                <div className={styles.commentDate}>
                  {cmt.createdAt
                    ? new Date(cmt.createdAt).toLocaleString()
                    : ""}
                </div>

                {/* 대댓글 입력창 (한번에 하나만 열림) */}
                {replyTarget === cmt.commentId && (
                  <div className={styles.replyInputWrapper}>
                    <textarea
                      placeholder="대댓글을 입력하세요"
                      value={replyInput}
                      onChange={(e) => setReplyInput(e.target.value)}
                    />
                    <button onClick={() => saveReply(cmt.commentId!)}>
                      대댓글 작성
                    </button>
                  </div>
                )}

                {/* 대댓글 리스트 (토글) */}
                {openReplies[cmt.commentId!] && (
                  <div className={styles.replyList}>
                    {comments
                      .filter((r) => r.parentId === cmt.commentId)
                      .map((reply, rIdx) => (
                        <div key={rIdx} className={styles.replyItem}>
                          <div className={styles.commentMain}>
                            <div>
                              <strong>{reply.nickname}</strong>:{" "}
                              {reply.content}
                            </div>
                            <div className={styles.commentActions}>
                              <button
                                onClick={() => {
                                  setShowReport(true);
                                  setTargetUserNum(reply.userId);
                                }}
                              >
                                🚨 신고
                              </button>

                              {/* 본인 대댓글일 때만 삭제 버튼 */}
                              {reply.userId === loginUserId && (
                                <button
                                  onClick={() =>
                                    handleDeleteComment(reply.commentId!)
                                  }
                                >
                                  ❌ 삭제
                                </button>
                              )}
                            </div>
                          </div>
                          <div className={styles.commentDate}>
                            {reply.createdAt
                              ? new Date(reply.createdAt).toLocaleString()
                              : ""}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )})}
        </div>
      </main>

      {/* 신고 모달 */}
      {showReport && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>🚨 신고하기</h2>
            <p>
              <b>신고 대상:</b> <u>{targetNickname}</u>
            </p>

            <label>신고 유형:</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value={1}>욕설 및 어그로</option>
              <option value={2}>음란 및 선정성</option>
              <option value={3}>도배 및 광고</option>
              <option value={4}>악의적 혐오 조장</option>
              <option value={5}>기타</option>
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
