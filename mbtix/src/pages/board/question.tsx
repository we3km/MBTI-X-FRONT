import { useEffect, useState } from "react";
import { api } from "../../api/boardApi";
import styles from "./Board.module.css";
import { Link } from "react-router-dom";
import type { Board } from "../../type/board";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";

type MBTIGroup<T extends string> = {
  label: string;
  options: T[];
  state: T | null;
  setState: React.Dispatch<React.SetStateAction<T | null>>;
};

export default function Question() {
  // ------------------ 상태 ------------------
  const nickname = useSelector((state: RootState) => state.auth.user?.nickname) || "익명";

  const [boardData, setBoardData] = useState<Board[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState<"latest" | "views">("latest");

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  // ------------------ MBTI 선택 상태 ------------------
  const [selectedEI, setSelectedEI] = useState<"E" | "I" | null>(null);
  const [selectedNS, setSelectedNS] = useState<"N" | "S" | null>(null);
  const [selectedFT, setSelectedFT] = useState<"F" | "T" | null>(null);
  const [selectedPJ, setSelectedPJ] = useState<"P" | "J" | null>(null);

  const allMBTIGroups: MBTIGroup<any>[] = [
    { label: "E/I", options: ["E", "I"], state: selectedEI, setState: setSelectedEI },
    { label: "N/S", options: ["N", "S"], state: selectedNS, setState: setSelectedNS },
    { label: "F/T", options: ["F", "T"], state: selectedFT, setState: setSelectedFT },
    { label: "P/J", options: ["P", "J"], state: selectedPJ, setState: setSelectedPJ },
  ];

  // ------------------ useEffect ------------------
  useEffect(() => {
    // 선택된 MBTI 값이 없는 경우 mbtiName 파라미터 제외
    const mbtiParam = allMBTIGroups.map(g => g.state ?? "_").join("");

    api
      .get("/board", {
        params: {
          categoryId: 1,
          ...(mbtiParam && { mbtiName: mbtiParam }),
        },
      })
      .then((res) => setBoardData(res.data))
      .catch((err) => {
        console.error(err);
        alert("게시글을 불러오는 중 오류가 발생했습니다.");
      });
  }, [selectedEI, selectedNS, selectedFT, selectedPJ]);

  // ------------------ 필터 & 정렬 ------------------
  const filteredPosts = boardData.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.nickname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortOption === "latest")
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortOption === "views") return b.view - a.view;
    return 0;
  });

  const handleSortChange = (option: "latest" | "views") => {
    setSortOption(option);
  };

  // ------------------ 페이지네이션 ------------------
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = sortedPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(sortedPosts.length / postsPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  // ------------------ 렌더링 ------------------
  return (
    <div className={styles.container}>
      <main className={styles.content}>
        <h1>궁금해 게시판</h1>

        {/* 검색창 + 버튼 그룹 */}
        <div className={styles["search-write-container"]}>
          <input
            type="text"
            placeholder="🔍제목 또는 작성자 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className={styles["button-group"]}>
            <div className={styles.dropdown}>
              <button className={styles["write-btn"]}>정렬 ▼</button>
              <div className={styles["dropdown-content"]}>
                <button onClick={() => handleSortChange("latest")}>최신순</button>
                <button onClick={() => handleSortChange("views")}>조회수 높은 순</button>
              </div>
            </div>

            <Link to={"/board/new?categoryId=1"}>
              <button className={styles["write-btn"]}>글쓰기</button>
            </Link>
          </div>
        </div>

        {/* 게시글 테이블 */}
        <table className={styles["post-table"]}>
          <thead>
            <tr>
              <th>제목</th>
              <th>작성자</th>
              <th>게시일</th>
              <th>조회수</th>
            </tr>
          </thead>
          <tbody>
            {currentPosts.length === 0 ? (
              <tr>
                <td colSpan={4}>작성된 글이 없습니다.</td>
              </tr>
            ) : (
              currentPosts.map((post) => (
                <tr key={post.boardId}>
                  <td>
                    <Link to={"/board/" + post.boardId+"?categoryId=1"}>
                      [{post.mbtiName ?? "-"}] {post.title}
                    </Link>
                  </td>
                  <td>{post.nickname}</td>
                  <td>{new Date(post.createdAt).toLocaleString()}</td>
                  <td>{post.view}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* 페이지네이션 */}
        <div className={styles.pagination}>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            이전
          </button>
          {pageNumbers.map((num) => (
            <button
              key={num}
              className={num === currentPage ? styles.active : ""}
              onClick={() => setCurrentPage(num)}
            >
              {num}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            다음
          </button>
        </div>

        {/* MBTI 선택 */}
        <h3 style={{ marginTop: "40px" }}>MBTI 선택</h3>
        <div style={{ margin: "20px 0", textAlign: "center" }}>
          {allMBTIGroups.map((group) => (
            <div key={group.label} style={{ marginBottom: "10px" }}>
              {group.options.map((opt) => (
                <button
                  key={opt}
                  style={{
                    margin: "5px",
                    padding: "8px 14px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    backgroundColor: group.state === opt ? "#007bff" : "#f5f5f5",
                    color: group.state === opt ? "#fff" : "#000",
                    cursor: "pointer",
                  }}
                  onClick={() => group.setState(opt === group.state ? null : opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          ))}
        </div>

        <p>
          선택한 MBTI:{" "}
          <strong>
            {selectedEI ?? "-"}
            {selectedNS ?? "-"}
            {selectedFT ?? "-"}
            {selectedPJ ?? "-"}
          </strong>
        </p>
      </main>
    </div>
  );
}
