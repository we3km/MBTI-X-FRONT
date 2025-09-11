import { useState, useEffect } from "react";
import styles from "./Board.module.css";
import { api } from "../../api/boardApi";

export default function Insert() {
  const [nickname, setNickname] = useState("익명");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("1");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const categorys = [
    { categoryId: "1", categoryName: "통합게시판" },
    { categoryId: "2", categoryName: "궁금해" },
    { categoryId: "3", categoryName: "MBTI게시판" },
  ];

  const userMbti = "ISTP";

  useEffect(() => {
    const savedNickname = localStorage.getItem("nickname") || "익명";
    setNickname(savedNickname);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles((prev) => [...prev, ...files]); // 기존 것 + 새로 선택한 것
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...urls]);
  };

  // 특정 이미지 삭제
  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const savePost = async () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("categoryId", selectedCategory);
    formData.append("mbtiName", userMbti);

    imageFiles.forEach((file) => {
      formData.append("images", file);
    });

    api
      .post("/board", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
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
          <input
            type="text"
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className={styles.flexRow}>
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

            {/* 이미지 첨부 */}
            <div className={styles.imageUpload}>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
              />
              <div className={styles.previewContainer}>
                {previewUrls.map((url, idx) => (
                  <div key={idx} className={styles.previewItem}>
                    <img
                      src={url}
                      alt={`미리보기 ${idx + 1}`}
                      className={styles.previewImage}
                    />
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => removeImage(idx)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
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
