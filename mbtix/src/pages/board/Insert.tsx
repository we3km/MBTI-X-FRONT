import { useState } from "react";
import styles from "./Board.module.css";
import { api } from "../../api/boardApi";
import { categorys, mbtiTypes } from "../../type/board";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { useSearchParams, useNavigate } from "react-router-dom"; // [추가] useNavigate

export default function Insert() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ISTJ");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate(); // [추가]

  const categoryId = searchParams.get('categoryId'); 

  const user = useSelector((state:RootState) => state.auth.user);
  const mbtiId = user?.mbtiId || 0 ;
  const userMbti = mbtiTypes.find( mbti => mbti.mbtiId == mbtiId)?.mbtiName || '';

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles((prev) => [...prev, ...files]);
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...urls]);
  };

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
      formData.append("boardMbti",selectedCategory);
    }

    imageFiles.forEach((file) => {
      formData.append("images", file);
    });

    try {
        // [수정] 백엔드로부터 생성된 게시글 정보를 response로 받습니다.
        const response = await api.post('/board', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        // [수정] 응답 데이터에서 새로운 게시글의 ID를 추출하여 상세 페이지로 이동합니다.
        const newBoardId = response.data.boardId;
        alert('게시글이 성공적으로 등록되었습니다.');
        navigate(`/board/${newBoardId}?categoryId=${categoryId}`); // categoryId도 함께 전달

    } catch (err) {
        console.error("게시글 등록 실패:", err);
        alert("서버 연결에 실패했습니다.");
    }
  };

  return (
    <div className={styles.wrapper}>
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