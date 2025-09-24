import React, { useEffect, useState } from "react";
import { signup, checkId, checkNickname, sendCode, verifyEmail, checkEmail } from "../../api/authApi"; 
import type { SignupRequest } from "../../type/logintype";
import styles from "./Signup.module.css";


export default function SignupForm({ onNext }: { onNext: () => void }) {

  const [loginId, setLoginId] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [name, setName] = useState("");
  const [mbtiId, setMbtiId] = useState("");


  
  
  const [idCheck,setidCheck] = useState(false);
  const [idMessage, setIdMessage] = useState("");
  const [idMessageColor, setIdMessageColor] = useState("red");
  
  //닉네임
  const [nickCheck,setnickCheck] = useState(false);
  const [nickMessage, setnickMessage] = useState("");
  const [nickMessageColor, setnickMessageColor] = useState("red");
  
  //이메일
  const [verificationCode, setVerificationCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailMessage,setEmailMessage] = useState("")
  const [emailMessageColor, setEmailMessageColor] = useState("red");
  const [emailCheck,setEmailCheck]= useState(false);
  
  const [password, setPassword] = useState("");
  const [pwMessage, setPwMessage] = useState("")
  const [pwMessageColor, setPwMessageColor] = useState("");
  const [isPwValid, setIsPwValid] = useState(false);
  const [isPwMatch, setIsPwMatch] = useState(false);

  
  //이메일 타이머
  const [cooldown, setCooldown] = useState(0); // 남은 시간(초)

// 아이디 중복 확인
const handleIdCheck = async () => {
  if (!loginId.trim()) {
    setIdMessage("아이디를 입력해 주세요.");
    setIdMessageColor("red");
    return;
  }

  // 길이 제한 체크
  if (loginId.length < 6 || loginId.length > 20) {
    setIdMessage("아이디는 6자 이상 20자 이하로 입력해 주세요.");
    setIdMessageColor("red");
    setidCheck(false);
    return;
  }

  const available = await checkId(loginId);
  if (available) {
    setidCheck(true);
    setIdMessage("사용 가능한 아이디입니다.");
    setIdMessageColor("green");
  } else {
    setidCheck(false);
    setIdMessage("이미 존재하는 아이디입니다.");
    setIdMessageColor("red");
  }
};

  // 닉네임 중복 확인
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

  // 이메일 코드 발송
const handleSendCode = async () => {
  if (!email.trim()) return alert("이메일을 입력해 주세요.");

  const available = await checkEmail(email);
  if(available){
  await sendCode(email);
  setCodeSent(true);
  setCooldown(15);

  // 타이머 시작
  const timer = setInterval(() => {
    setCooldown(prev => {
      if (prev <= 1) {
        clearInterval(timer);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
}else{
  setCodeSent(false);
  setEmailMessage("이미 가입된 이메일입니다.")
  setEmailMessageColor("red");
}
};


  // 이메일 인증
  const handleEmailVerify = async () => {
  try {
    await verifyEmail(email, verificationCode);
    setEmailVerified(true);         
  } catch (err: any) {
    alert(err.response?.data || "인증 코드가 틀리거나 만료됨");
    setEmailVerified(false);
  }
};

// 비밀번호 유효성 검사 (6자 이상 + 숫자 + 특수문자 필수)
const validatePassword = (value: string) => {
  const hasNumber = /\d/.test(value); // 숫자 포함 여부
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value); // 특수문자 포함 여부
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

  setPwMessage(""); // 모든 조건 충족 시 에러메시지 제거
  setIsPwValid(true);
};

// 입력할 때마다 검사
useEffect(() => {
  validatePassword(password);
  if (password && passwordConfirm) {
    setIsPwMatch(password === passwordConfirm);
  } else {
    setIsPwMatch(false);
  }
}, [password, passwordConfirm]);


  // 회원가입
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const signupData: SignupRequest = {
      loginId,
      nickname,
      email,
      password,
      name,
      mbtiId: Number(mbtiId),
      verificationCode,
      agree1: true, 
      agree2: true,
      agree3: true,
    };

     await signup(signupData);  
      onNext();
  };

return (
  <form className={styles.signupBox} onSubmit={handleSubmit}>
    <h2>정보 입력</h2>

    <div className={styles.formFields}>
      {/* 아이디 */}
      {idMessage && (
        <p className={styles.msgRight} style={{ color: idMessageColor }}>{idMessage}</p>
      )}
      <div className={styles.inputCheck}>
        <input
          value={loginId}
          type="text"
          onChange={(e) => { setLoginId(e.target.value); setidCheck(false); setIdMessage(""); }}
          placeholder="아이디"
        />
        <button type="button" onClick={handleIdCheck} disabled={idCheck}>중복 확인</button>
      </div>

      {/* 닉네임 */}
      {nickMessage && (
        <p className={styles.msgRight} style={{ color: nickMessageColor }}>{nickMessage}</p>
      )}
      <div className={styles.inputCheck}>
        <input
          value={nickname}
          type="text"
          onChange={(e) => { setNickname(e.target.value); setnickCheck(false); setnickMessage(""); setIdMessage("") }}
          placeholder="닉네임"
        />
        <button type="button" onClick={handleNicknameCheck} disabled={nickCheck}>중복 확인</button>
      </div>

      {/* 이메일 */}
      {emailMessage && (
        <p className={styles.msgRight} style={{ color: emailMessageColor }}>{emailMessage}</p>
      )}
      <div className={styles.inputCheck}>
        <input
          value={email}
          type="email"
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailCheck(false);
            setEmailMessage("");
            setCodeSent(false);
            setCooldown(0);
            setnickMessage("");
          }}
          placeholder="이메일"
        />
        <button type="button" onClick={handleSendCode} disabled={cooldown > 0 || emailCheck}>
          {codeSent
            ? (cooldown > 0 ? `재발송 (${Math.floor(cooldown / 60)}:${String(cooldown % 60).padStart(2, "0")})` : "재발송")
            : "코드 발송"}
        </button>
      </div>

      {/* 이메일 인증코드 */}
      {codeSent && (
        <div className={styles.inputCheck}>
          <input
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            type="email"
            placeholder="인증 코드"
            disabled={emailVerified}
          />
          <button type="button" onClick={handleEmailVerify} disabled={emailVerified}>
            {emailVerified ? "인증완료" : "확인"}
          </button>
        </div>
      )}

      {/* 비밀번호 유효성/일치 메시지 */}
      {password && !isPwValid && (
        <p className={styles.msgRight} style={{ color: "red" }}>{pwMessage}</p>
      )}
      {passwordConfirm && !isPwMatch && (
        <p className={styles.msgRight} style={{ color: pwMessageColor }}>비밀번호가 일치하지 않습니다.</p>
      )}

      {/* 비밀번호 / 비밀번호 확인 (두 칸 동일폭) */}
      <div className={styles.rowTwo}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
        />
        <input
          type="password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          placeholder="비밀번호 확인"
        />
      </div>

      {/* 이름 + MBTI (3열: 입력 | 라벨 | 셀렉트) */}
      <div className={styles.rowNameMbti}>
        <input
          value={name}
          type="text"
          onChange={(e) => setName(e.target.value)}
          placeholder="이름"
        />
        <label className={styles.inlineRightLabel}></label>
        <select
          value={mbtiId}
          onChange={(e) => setMbtiId(e.target.value)}
          required>
         <option value="">MBTI를 선택하세요</option>
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

      <button
        type="submit"
        className={styles.submitBtn}
        disabled={ !emailVerified || !idCheck || !nickCheck || (passwordConfirm && !isPwMatch) ||!name ||!mbtiId}>  
        회원가입</button>
    </div>
  </form>
);
}