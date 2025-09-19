import { useState } from "react";
import styles from "./Change.module.css";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { deductMbtiPoint } from "../../api/mypageApi";
import { useNavigate } from "react-router-dom";
import { setAuth } from "../../features/authSlice";

interface ChangeMbtiProps {
  onClose: () => void; 
}

export default function ChangeMbti({ onClose }: ChangeMbtiProps) {

  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const refreshToken = useSelector((state: RootState) => state.auth.refreshToken);
  const user = useSelector((state: RootState) => state.auth.user);
  const [mbitMessage, setMbtiMessage] = useState("");
  const [mbitMessageColor, setMbtiMessageColor] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChangeMbti = async () => {
    if (!user?.userId) {
      setMbtiMessage("로그인이 필요합니다.");
      setMbtiMessageColor("red");
      return;
    }
    if ((user?.point ?? 0) < 500) {
      setMbtiMessage("❌ 포인트가 부족합니다.");
      setMbtiMessageColor("red");
      return;
    }

    try {
      const res = await deductMbtiPoint(user.userId);
      dispatch(
        setAuth({
      accessToken,// 기존 토큰 유지
      refreshToken,
      userId: user.userId,
      user: {
        ...user,
        point: res.point,
      },
      retestAllowed: true
        })
      )
      navigate("/MbtiTest");
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 400) {
        setMbtiMessage("포인트가 부족합니다."); 
      } else {
        setMbtiMessage("오류가 발생했습니다.");
      }
      setMbtiMessageColor("red");
    }
  };

  return (
    <>
      <div>
      <h3 className={styles.title}>MBTI 재검사</h3>
      <p className={styles.notice}>MBTI 재검사는 1000포인트 소모됩니다.</p>
      {mbitMessage && (
        <p style={{ color: mbitMessageColor, marginTop: "8px" }}>
          {mbitMessage}
        </p>
      )}
    </div>
    <div className={styles.btnGroup}>
      <button className={styles.btnPrimary} onClick={handleChangeMbti}>확인</button>
      <button className={styles.btn}  onClick={onClose}>취소</button>
    </div>
    </>
  );
}
