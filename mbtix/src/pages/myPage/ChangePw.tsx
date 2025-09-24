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
  const [pwCheck,setPwCheck] = useState("");
  const [pwCheckColor,setPwCheckColor] = useState("red");
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
    }

    if (newPw && passwordConfirm) {
      setIsPwMatch(newPw === passwordConfirm);
    } else {
      setIsPwMatch(false);
    }
  }, [newPw, passwordConfirm]);

  // 현재 비밀번호 확인 (백엔드 API 연동 예정)
  const handleCheckPw = async () => {
  if (!user || !user.userId) {
    setPwMessage("로그인이 필요합니다.");
    setPwMessageColor("red");
    return;
  }

  // 🔒 소셜 로그인 계정이면 막기
  if (user.provider) {
    setPwMessage("❌ 소셜 로그인 계정은 비밀번호를 변경할 수 없습니다.");
    setPwMessageColor("red");
    return;
  }

  if (!currentPw.trim()) {
    setPwMessage("현재 비밀번호를 입력해 주세요.");
    setPwMessageColor("red");
    return;
  }

  try {
    const available = await checkPw(currentPw, user.userId);

    if (available) {
      setPwCheck("✅ 현재 비밀번호가 확인되었습니다.");
      setPwCheckColor("green");
      setIsCurrentPwValid(true);
    } else {
      setPwCheck("❌ 현재 비밀번호가 올바르지 않습니다.");
      setPwCheckColor("red");
      setIsCurrentPwValid(false);
    }
  } catch (err) {
    setPwCheck("❌ 서버 오류가 발생했습니다.");
    setPwCheckColor("red");
  }
};

  const handleChangePw = async () => {
  if (!user || !user.userId) {
    setPwMessage("로그인이 필요합니다.");
    setPwMessageColor("red");
    return;
  }

  // 🔒 소셜 로그인 계정이면 막기
  if (user.provider) {
    setPwMessage("❌ 소셜 로그인 계정은 비밀번호를 변경할 수 없습니다.");
    setPwMessageColor("red");
    return;
  }

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

  try {
    await updatePw(newPw, user.userId);
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

    {user?.provider ? (
      <p style={{ color: "red" }}>❌ 소셜 로그인 계정은 비밀번호를 변경할 수 없습니다.</p>
    ) : (
      <>
        {/* 현재 비밀번호 확인 */}
        {pwCheck && (
          <p style={{ color: pwCheckColor, fontSize: "13px", textAlign: "right" }}>
            {pwCheck}
          </p>
        )}
        <div className={styles.row}>
          <label>현재 비밀번호 :</label>
          <input
            type="password"
            value={currentPw}
            onChange={(e) => setCurrentPw(e.target.value)}
            className={styles.input}
            disabled={isCurrentPwValid}
            placeholder="현재 비밀번호 입력"
          />
          <button
            className={styles.btn}
            onClick={handleCheckPw}
            disabled={isCurrentPwValid}
          >
            확인
          </button>
        </div>

        {/* 현재 비밀번호 확인된 경우만 노출 */}
        {isCurrentPwValid && (
          <>
            {/* 새 비밀번호 */}
            <div className={styles.row}>
              <label htmlFor="newPw">새 비밀번호 :</label>
              <input
                id="newPw"
                type="password"
                value={newPw}
                onChange={(e) => {
                  setNewPw(e.target.value);
                  setPwCheck("");
                }}
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
            {pwMessage && (
              <p style={{ color: pwMessageColor, fontSize: "13px", textAlign: "right" }}>
                {pwMessage}
              </p>
            )}
            {passwordConfirm && !isPwMatch && (
              <p style={{ color: "red", fontSize: "13px", textAlign: "right" }}>
                비밀번호가 일치하지 않습니다.
              </p>
            )}

            {/* 변경 버튼 */}
            <div className={styles.btnGroup}>
              <button
                className={styles.btnPrimary}
                onClick={handleChangePw}
                disabled={!isPwValid || !isPwMatch}
              >
                비밀번호 변경
              </button>
            </div>
          </>
        )}
      </>
    )}
  </div>
);
}
