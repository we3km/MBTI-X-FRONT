import { useState, useEffect } from "react";
import styles from "./Board.module.css";
import { api } from "../../api/boardApi";
import BoardHeader from "./BoardHeader";
import { categorys, mbtiTypes } from "../../type/board";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { useLocation, useParams, useSearchParams } from "react-router-dom";

export default function Insert() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ISTJ");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();

  // 'id' 파라미터의 값 가져오기
  const categoryId = searchParams.get('categoryId'); 

  const user = useSelector((state:RootState) => state.auth.user);    
  const mbtiId = user?.mbtiId || 0 ;
  const userMbti = mbtiTypes.find( mbti => mbtiId === mbtiId)?.mbtiName || '';

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
    formData.append("categoryId", categoryId!!);
    formData.append("mbtiName", userMbti);

    if(categoryId == '1'){
      // 궁금해 게시판인 경우, 선택한 대상 MBIT가 서버로 전송될 수 있도록 수정
      formData.append("boardMbti",selectedCategory);
    }


    imageFiles.forEach((file) => {
      formData.append("images", file);
    });

    api
      .post("/board", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        window.location.href = `/board?boardMbti=${selectedCategory}`;
      })
      .catch((err) => {
        console.error(err);
        alert("서버 연결에 실패했습니다.");
      });
  };

  return (
    <div className={styles.wrapper}>
      {/* 헤더 */}
      <BoardHeader/>

      <div className={styles.container}>
        <main className={styles.content}>
          <input
            type="text"
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className={styles.flexRow}>
          {
            categoryId === '1' && 
            <div className={styles.leftDropdown}>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categorys.map((cat) => (
                  <option key={cat.categoryId} value={cat.categoryName}>
                    #{cat.categoryName}
                  </option>
                ))}
              </select>
            </div>
          }
         

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
