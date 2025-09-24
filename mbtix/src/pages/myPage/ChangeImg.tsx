import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import styles from "./ChangeProfileImg.module.css";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../store/store";
import { setAuth } from "../../features/authSlice";
import { updateProfileImg } from "../../api/mypageApi";
import { getCroppedImg } from "../myPage/getCroppedImg";

export default function ChangeProfileImg() {
  const user = useSelector((s: RootState) => s.auth.user);
  const accessToken = useSelector((s: RootState) => s.auth.accessToken);
  const refreshToken = useSelector((s: RootState) => s.auth.refreshToken);
  const dispatch = useDispatch();

  const [preview, setPreview] = useState<string | null>(null);     // 미리보기 URL
  const [cropping, setCropping] = useState(false);                  // 크롭 모드
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [croppedFile, setCroppedFile] = useState<File | null>(null); // ✅ 최종 업로드 파일
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("red");

  const [crop, setCrop] = useState({ x: 0, y: 0 });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPreview(URL.createObjectURL(f));
    setCropping(true);
    setCroppedFile(null);           // ✅ 이전 결과 초기화
    setCroppedAreaPixels(null);
    setMessage("");
  };

  const onCropComplete = useCallback((_: any, areaPx: any) => {
    setCroppedAreaPixels(areaPx);
  }, []);

  const handleConfirm = async () => {
    if (!preview || !croppedAreaPixels) return;
    try {
      const file = await getCroppedImg(preview, croppedAreaPixels);
      setCroppedFile(file);                               
      setPreview(URL.createObjectURL(file));               // 미리보기 교체
      setCropping(false);
      setConfirmed(true);
      setCroppedAreaPixels(null);                          
      setMessage("✂️ 자르기 완료! 저장 버튼을 눌러주세요.");
      setMessageColor("green");
    } catch {
      setMessage("❌ 자르기 실패. 다시 시도해주세요.");
      setMessageColor("red");
    }
  };

  const handleCancel = () => {
    setPreview(null);
    setCropping(false);
    setCroppedAreaPixels(null);
    setCroppedFile(null);
    setConfirmed(false);
    setMessage("");
  };

const handleSubmit = async () => {
  if (!user || !croppedFile) {
    setMessage("이미지를 자르고 '확인'을 눌러주세요.");
    return;
  }

  if ((user?.point ?? 0) < 500) {
    setMessage("❌ 포인트가 부족합니다.");
    setMessageColor("red");
    return;
  }

  try {
    const res = await updateProfileImg(user.userId, croppedFile);
    dispatch(
      setAuth({
        accessToken,
        refreshToken,
        userId: user.userId,
        user: { ...user, profileFileName: res.profileFileName, point: res.point },
      })
    );
    setMessage("🎉 프로필 이미지가 변경되었습니다!");
    setMessageColor("blue");
  } catch {
    setMessage("❌ 업로드 실패. 다시 시도해주세요.");
    setMessageColor("red");
  }
};

return (
  <div className={styles.modal}>
    <h3>프로필 이미지 변경</h3>

    {/* 아바타 클릭 → 파일 선택 */}
    <div className={styles.previewBox}>
      <input
        type="file"
        id="profileInput"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <label htmlFor="profileInput" className={styles.previewLabel}>
        {preview && !cropping ? (
          <img src={preview} alt="미리보기" className={styles.previewImg} />
        ) : !preview ? (
          <div className={styles.placeholder}>📷 클릭해서 사진 선택</div>
        ) : null}
      </label>
    </div>

    {/* 크롭 중일 때만 크로퍼 표시 */}
    {preview && cropping && (
      <>
        <div className={styles.cropContainer}>
          <Cropper
            image={preview}
            crop={crop}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
          />
        </div>
        <div className={styles.btnGroup}>
          <button onClick={handleConfirm} className={styles.confirmBtn}>
            확인
          </button>
          <button onClick={handleCancel} className={styles.cancelBtn}>
            취소
          </button>
        </div>
      </>
    )}

    {message && <p style={{color: messageColor}} className={styles.message}>{message}</p>}

    <div className={styles.btnGroup}>
      <button
        onClick={handleSubmit}
        className={styles.saveBtn}
        disabled={!confirmed} 
      >
        저장 (500P 차감)
      </button>
    </div>
  </div>
);
}
