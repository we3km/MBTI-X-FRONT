import { useState, useEffect } from "react";
import styles from "./Change.module.css";
import { checkPw, updatePw } from "../../api/mypageApi";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";

export default function ChangePw() {

  const user = useSelector((state: RootState) => state.auth.user);

  const [currentPw, setCurrentPw] = useState(""); // 현재 비밀번호
  const [newPw, setNewPw] = useState("");         // 새 비밀번호
  const [passwordConfirm, setPasswordConfirm] = useState(""); // 새 비밀번호 확인

  // 유효성 상태
  const [pwMessage, setPwMessage] = useState("");
  const [pwMessageColor, setPwMessageColor] = useState("red");
  const [isPwValid, setIsPwValid] = useState(false);
  const [isPwMatch, setIsPwMatch] = useState(false);
  const [isCurrentPwValid, setIsCurrentPwValid] = useState(false);

  // 비밀번호 유효성 검사 (6자 이상 + 숫자 + 특수문자 필수)
  const validatePassword = (value: string) => {
    const hasNumber = /\d/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const isLengthValid = value.length >= 6;

    if (!isLengthValid) {
      setPwMessage("비밀번호는 최소 6자 이상이어야 합니다.");
      setPwMessageColor("red");
      setIsPwValid(false);
      return;
    }
    if (!hasNumber) {
      setPwMessage("비밀번호에 숫자가 포함되어야 합니다.");
      setPwMessageColor("red");
      setIsPwValid(false);
      return;
    }
    if (!hasSpecial) {
      setPwMessage("비밀번호에 특수문자가 포함되어야 합니다.");
      setPwMessageColor("red");
      setIsPwValid(false);
      return;
    }

    setPwMessage(""); 
    setIsPwValid(true);
  };

  // 입력할 때마다 검사
  useEffect(() => {
    if (newPw) {
      validatePassword(newPw);
    } else {
      setIsPwValid(false);
      setPwMessage("");
    }

    if (newPw && passwordConfirm) {
      setIsPwMatch(newPw === passwordConfirm);
    } else {
      setIsPwMatch(false);
    }
  }, [newPw, passwordConfirm]);

  // 현재 비밀번호 확인 (백엔드 API 연동 예정)
  const handleCheckPw = async () => {
    if (!currentPw.trim()) {
      setPwMessage("현재 비밀번호를 입력해 주세요.");
      setPwMessageColor("red");
      return;
    }
    if (!user || !user.userId) {
    setPwMessage("로그인이 필요합니다.");
    setPwMessageColor("red");
    return;
  }
  try {
    const available = await checkPw(currentPw, user.userId);

    if (available) {
      setPwMessage("✅ 현재 비밀번호가 확인되었습니다.");
      setPwMessageColor("green");
      setIsCurrentPwValid(true);
    } else {
      setPwMessage("❌ 현재 비밀번호가 올바르지 않습니다.");
      setPwMessageColor("red");
      setIsCurrentPwValid(false);
    }
  } catch (err) {
    setPwMessage("❌ 서버 오류가 발생했습니다.");
    setPwMessageColor("red");
  }
};

  // 새 비밀번호 변경 요청
  const handleChangePw = async () => {
    if (!isPwValid) {
      setPwMessage("❌ 비밀번호 조건을 만족하지 않습니다.");
      setPwMessageColor("red");
      return;
    }
    if (!isPwMatch) {
      setPwMessage("❌ 비밀번호가 일치하지 않습니다.");
      setPwMessageColor("red");
      return;
    }
    if (!user || !user.userId) {
    setPwMessage("로그인이 필요합니다.");
    setPwMessageColor("red");
    return;
    }
    try {
      // TODO: 실제 API 호출
      await updatePw(newPw,user?.userId);
      setPwMessage("🎉 비밀번호가 성공적으로 변경되었습니다.");
      setPwMessageColor("blue");
      setCurrentPw("");
      setNewPw("");
      setPasswordConfirm("");
    } catch (err) {
      setPwMessage("❌ 비밀번호 변경에 실패했습니다.");
      setPwMessageColor("red");

      
    }
  };

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>비밀번호 변경</h3>

      {/* 현재 비밀번호 확인 */}
      <div className={styles.row}>
        <label>현재 비밀번호 :</label>
        <input
          type="password"
          value={currentPw}
          onChange={(e) => setCurrentPw(e.target.value)}
          className={styles.input}
          placeholder="현재 비밀번호 입력"
        />
        <button className={styles.btn} onClick={handleCheckPw}>
          확인
        </button>
      </div>

      {/* 새 비밀번호 입력 */}
      <div className={styles.row}>
        <label htmlFor="newPw">새 비밀번호 :</label>
        <input
          id="newPw"
          type="password"
          value={newPw}
          onChange={(e) => setNewPw(e.target.value)} // ✅ 수정
          className={styles.input}
          placeholder="새 비밀번호 입력"
        />
      </div>

      {/* 새 비밀번호 확인 */}
      <div className={styles.row}>
        <label htmlFor="passwordConfirm">비밀번호 확인 :</label>
        <input
          id="passwordConfirm"
          type="password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          className={styles.input}
          placeholder="비밀번호 다시 입력"
        />
      </div>

      {/* 유효성 메시지 */}
      {pwMessage && (
        <p
          style={{
            color: pwMessageColor,
            fontSize: "13px",
            margin: "4px 0 0 0",
            textAlign: "right",
          }}
        >
          {pwMessage}
        </p>
      )}

      {/* 비밀번호 불일치 메시지 */}
      {passwordConfirm && !isPwMatch && (
        <p
          style={{
            color: "red",
            fontSize: "13px",
            margin: "4px 0 0 0",
            textAlign: "right",
          }}
        >
          비밀번호가 일치하지 않습니다.
        </p>
      )}

      {/* 버튼 그룹 */}
      <div className={styles.btnGroup}>
        <button className={styles.btnPrimary} onClick={handleChangePw} disabled={!isPwValid || !isPwMatch}>
          비밀번호 변경
        </button>
      </div>
    </div>
  );
}
