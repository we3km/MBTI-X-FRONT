import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { useState } from "react";
import styles from "./Change.module.css";
import { checkNickname } from "../../api/authApi";
import { updateNick } from "../../api/mypageApi";
import { setAuth } from "../../features/authSlice";

export default function ChangeNick() {
  const [newNickname, setNewNickname] = useState(""); 
  const user = useSelector((state: RootState) => state.auth.user);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const refreshToken = useSelector((state: RootState) => state.auth.refreshToken);
  const dispatch = useDispatch();

  //닉네임
    const [nickCheck,setnickCheck] = useState(false);
    const [nickMessage, setnickMessage] = useState("");
    const [nickMessageColor, setnickMessageColor] = useState("red");

  const handleCheckNick = async () => {
    if(!newNickname.trim()){
      setnickMessage("변경할 닉네임을 입력해 주세요.");
      setnickMessageColor("red")
      return
    }
  const available = await checkNickname(newNickname);
    if(available){
      setnickCheck(true);
      setnickMessage("사용 가능한 닉네임입니다.")
      setnickMessageColor("green");
    }else{
      setnickCheck(false);
      setnickMessage("이미 존재하는 닉네임입니다.");
      setnickMessageColor("red");
   }
  };

  // 닉네임 변경
  const handleChangeNickname = async () => {
    if (!nickCheck) {
      setnickMessage("닉네임 중복 확인을 먼저 해주세요.");
      setnickMessageColor("red");
      return;
    }

    if (!user?.userId) {
      setnickMessage("로그인이 필요합니다.");
      setnickMessageColor("red");
      return;
    }

    try {
      const res = await updateNick(newNickname, user.userId,user.point);

    // Redux store 업데이트
   dispatch(
      setAuth({
      accessToken,// 기존 토큰 유지
      refreshToken,
      userId: user.userId,
      user: {
        ...user,
        nickname: res.nickname,
        point: res.point,
      },
    })
    );
      setnickMessage("🎉 닉네임이 변경되었습니다.");
      setnickMessageColor("blue");
      setnickCheck(false);
      setNewNickname("");
    } catch (err) {
      setnickMessage("❌ 닉네임 변경에 실패했습니다.");
      setnickMessageColor("red");
    }
  };
  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>닉네임 변경</h3>
      <p className={styles.notice}>
        닉네임 변경 시 500 포인트가 차감됩니다.
      </p>

      <div className={styles.row}>
        <label>현재 닉네임 :</label>
        <span className={styles.currentNick}>
          {user?.nickname || "-"}
        </span>
      </div>

        { nickMessage && <p style={{ color: nickMessageColor, fontSize: "13px",margin: "4px 0 0 0",textAlign: "right"  }}>{nickMessage}</p> }
      <div className={styles.row}>
        <label htmlFor="newNickname">변경할 닉네임 :</label>
        <input
          value={newNickname}
          onChange={(e) => {setNewNickname(e.target.value); setnickCheck(false); setnickMessage("")}}
          className={styles.input}
          placeholder="변경할 닉네임 입력"
        />
      </div>

      
      <div className={styles.btnGroup}>
        <button className={styles.btn} onClick={handleCheckNick} disabled={nickCheck}>
          중복 확인
        </button>
        <button className={styles.btnPrimary} onClick={handleChangeNickname}>
          닉네임 변경
        </button>
      </div>
    </div>
  );
}
