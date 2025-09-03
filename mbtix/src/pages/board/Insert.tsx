import { useState, useEffect } from "react";
import styles from "./Board.module.css";
import { api } from "../../api/boardApi";

export default function Insert() {
  const [nickname, setNickname] = useState("익명");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("1"); // 기본값 통합게시판

  const categorys = [
    { categoryId: "1", categoryName: "통합게시판" },
    { categoryId: "2", categoryName: "궁금해" },
    { categoryId: "3", categoryName: "MBTI게시판" },
  ];

  const userMbti = "ISTP"; // 로그인 후 얻어올 정보

  // 닉네임 로컬스토리지에서 불러오기
  useEffect(() => {
    const savedNickname = localStorage.getItem("nickname") || "익명";
    setNickname(savedNickname);
  }, []);

  // 글 저장 함수
  const savePost = async () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    api
      .post("/board", {
        title,
        content,
        categoryId: selectedCategory,
        mbtiName: userMbti,
      })
      .then((res) => {
        // 글 등록 후 게시글 다시 불러오기
        window.location.href = "/board";
      })
      .catch((err) => {
        console.error(err);
        alert("서버 연결에 실패했습니다.");
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
              <a href="/mbti">전용 게시판</a>
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

      <div className={styles.container}>
        <main className={styles.content}>
        

          {/* 글쓰기 폼 */}
          <input
            type="text"
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* 카테고리 선택 */}
          <div className={styles.leftDropdown}>
            <select
                 value={selectedCategory}
                 onChange={(e) => setSelectedCategory(e.target.value)}
            >
            {categorys.map((cat) => (
              <option key={cat.categoryId} value={cat.categoryId}>
               #{cat.categoryName}
               </option>
                ))}
            </select>
          </div>

          <textarea
            placeholder="내용을 입력하세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button onClick={savePost}>작성 완료</button>
        </main>
      </div>
    </div>
  );
}
