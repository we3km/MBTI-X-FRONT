import React, { useState } from "react";
import { signup, checkId, checkNickname, sendCode, verifyEmail, checkEmail } from "../../api/authApi"; 
import type { SignupRequest } from "../../type/logintype";
import styles from "./Signup.module.css";


export default function SignupForm({ onNext }: { onNext: () => void }) {

  const [loginId, setLoginId] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [name, setName] = useState("");
  const [mbtiId, setMbti] = useState("");


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

  //이메일 타이머
  const [cooldown, setCooldown] = useState(0); // 남은 시간(초)

  // 아이디 중복 확인
const handleIdCheck = async () => {
  if (!loginId.trim()) {
    setIdMessage("아이디를 입력해 주세요.");
    setIdMessageColor("red");
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
  setCooldown(10);

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

  //비밀번호 검증
  const isPwMatch = password === passwordConfirm;


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

     { idMessage && <p style={{ color: idMessageColor, fontSize: "13px",margin: "4px 0 0 0",textAlign: "right"  }}>{idMessage}</p> }
    <div className={styles.inputCheck}>
      <input value={loginId} onChange={e => {setLoginId(e.target.value); setidCheck(false); setIdMessage("")}} placeholder="아이디" />
      <button type="button" onClick={handleIdCheck} disabled={idCheck}>중복 확인</button>
    </div>
   
     { nickMessage && <p style={{ color: nickMessageColor, fontSize: "13px",margin: "4px 0 0 0",textAlign: "right"  }}>{nickMessage}</p> }
    <div className={styles.inputCheck}>
      <input value={nickname} onChange={e => {setNickname(e.target.value); setnickCheck(false); setnickMessage("")}} placeholder="닉네임" />
      <button type="button" onClick={handleNicknameCheck} disabled={nickCheck}>중복 확인</button>
    </div>

    { emailMessage && <p style={{color : emailMessageColor,fontSize:"13px",margin:"4px 0 0 0",textAlign: "right"}}>{emailMessage}</p>}
    <div className={styles.inputCheck}>
      <input value={email} onChange={e => {setEmail(e.target.value); setEmailCheck(false); setEmailMessage(""); setCodeSent(false); setCooldown(0);}} placeholder="이메일" />
      <button type="button" onClick={handleSendCode} disabled={cooldown > 0 || emailCheck}>
        {cooldown > 0 ? `재발송 (${Math.floor(cooldown / 60)}:${String(cooldown % 60).padStart(2, "0")})` : "코드 발송"}</button>
    </div>

  {codeSent && (
  <div className={styles.inputCheck}>
    <input
      value={verificationCode}
      onChange={e => setVerificationCode(e.target.value)}
      placeholder="인증 코드"
      disabled={emailVerified}   
    />
    <button
      type="button"
      onClick={handleEmailVerify}
      disabled={emailVerified}  
    >
      {emailVerified ? "인증완료" : "확인"}
    </button>
  </div>
)}
    {passwordConfirm && !isPwMatch && (
      <p style={{ color: "red", fontSize: "13px" ,margin: "4px 0 0 0", textAlign: "right" }}>비밀번호가 일치하지 않습니다.</p>
    )}
    {passwordConfirm && isPwMatch && (
      <p style={{ color: "green", fontSize: "13px" ,margin: "4px 0 0 0", textAlign: "right" }}>비밀번호가 일치합니다.</p>
    )}
    <div className={styles.inputCheck}>
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="비밀번호" />
      <input type="password" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} placeholder="비밀번호 확인" />
    </div>

    <div className={styles.inputCheck}>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="이름" />
      <input value={mbtiId} onChange={e => setMbti(e.target.value)} placeholder="MBTI" />
    </div>

    <button type="submit" className={styles.submitBtn} disabled={!emailVerified || !idCheck || !nickCheck || passwordConfirm && !isPwMatch || !name || !mbtiId}>
      회원가입
    </button>
  </form>
);
}