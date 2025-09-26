import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { checkNickname } from "../../api/authApi";
import styles from "./Signup.module.css";

export default function SocialSignup() {
  const [nickname, setNickname] = useState("");
  const [mbtiId, setMbtiId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  // 백엔드에서 redirect로 내려준 쿼리 파라미터 파싱
  const params = new URLSearchParams(location.search);
  const provider = params.get("provider") ?? "";
  const providerUserId = params.get("providerUserId") ?? "";
  const email = params.get("email") ?? ""; // 카카오/네이버에서 받은 이메일
  const name = params.get("name") ?? "";   // 카카오 프로필 닉네임
  const profileImageUrl = params.get("profileImageUrl") ?? "";
  const accessToken = params.get("accessToken") ?? "";

  //닉네임
  const [nickCheck,setnickCheck] = useState(false);
  const [nickMessage, setnickMessage] = useState("");
  const [nickMessageColor, setnickMessageColor] = useState("red");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
       await axios.post("/api/auth/social-signup", {
        loginId: email,  // 이메일을 loginId로 사용
        email,
        name,
        nickname,
        mbtiId,
        provider,
        providerUserId,
        accessToken,
        profileImageUrl,
      });

      navigate("/signup-complete", { replace: true });
    } catch (err: any) {
      console.error(err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (typeof err.response?.data === "string") {
        setError(err.response.data);
      } else {
        setError("회원가입 실패");
      }
    }
  };

  const handleNicknameCheck = async () => {
     if(!nickname.trim()){
      setnickMessage("닉네임을 입력해 주세요.");
      setnickMessageColor("red")
      return;
     }
  
     const available = await checkNickname(nickname);
     if(available) {
      setnickCheck(true);
      setnickMessage("사용 가능한 닉네임입니다.");
      setnickMessageColor("green");
     }else{
      setnickCheck(false);
      setnickMessage("이미 존재하는 닉네임입니다.");
      setnickMessageColor("red");
     }
    };

return (
  <form className={styles.signupBox} onSubmit={handleSubmit}>
    <h2>소셜 회원가입</h2>

    <div className={styles.formFields}>
      {/* 읽기 전용 정보 */}
      <div className={styles.displayRow}>
        <input value={email} type="text" readOnly className={styles.readonlyField} />
      </div>

      <div className={styles.displayRow}>
        <input type="text" value={name} readOnly className={styles.readonlyField} />
      </div>

      {/* 닉네임 */}
      {nickMessage && (
        <p className={styles.msgRight} style={{ color: nickMessageColor }}>{nickMessage}</p>
      )}
      <div className={styles.inputCheck}>
        <input
          value={nickname}
          onChange={(e) => { setNickname(e.target.value); setnickCheck(false); setnickMessage(""); }}
          type="text"
          placeholder="닉네임"
        />
        <button type="button" onClick={handleNicknameCheck} disabled={nickCheck}>중복 확인</button>
      </div>

      {/* MBTI (라벨 | 셀렉트) */}
      <div className={styles.rowLabelSelect}>
        <select
          className={styles.selectField}
          value={mbtiId}
          onChange={(e) => setMbtiId(e.target.value)}
          required
        >
          <option value="">MBTI를 선택해 주세요</option>
          <option value="1">ISTJ</option>
          <option value="2">ISFJ</option>
          <option value="3">INFJ</option>
          <option value="4">INTJ</option>
          <option value="5">ISTP</option>
          <option value="6">ISFP</option>
          <option value="7">INFP</option>
          <option value="8">INTP</option>
          <option value="9">ESTP</option>
          <option value="10">ESFP</option>
          <option value="11">ENFP</option>
          <option value="12">ENTP</option>
          <option value="13">ESTJ</option>
          <option value="14">ESFJ</option>
          <option value="15">ENFJ</option>
          <option value="16">ENTJ</option>
        </select>
      </div>

      {error && <div className={styles.errorText}>{error}</div>}

      <button type="submit" className={styles.submitBtn} disabled={!nickCheck}>
        회원가입 완료
      </button>
    </div>
  </form>
);
}
