import { useEffect, useState } from "react";
import { idMatch, nameMatch, verifyEmail } from "../../api/authApi";
import axios from "axios";
import styles from "./Find.module.css";

export default function Findpw(){


    //이름
    const [name, setName] = useState(""); 
    const [nameMessage, setnameMessage] = useState("");
    const [nameMessageColor, setnameMessageColor] = useState("red");
    const [namecheck,setNameCheck] = useState(false)

    //아이디
    const [loginId,setLoginId] = useState("");
    const [idMessage,setIdMessage] = useState("");
    const [idMessageColor,setIdMessageColor] = useState("");
    const [idCheck,setIdCheck] = useState(false)

    //이메일
    const [codeSent, setCodeSent] = useState(false); 
    const [cooldown, setCooldown] = useState(0); 
    const [verificationCode, setVerificationCode] = useState(""); 
    const [emailVerified, setEmailVerified] = useState(false); 
    const [email, setEmail] = useState("");
    const [emailMessage, setEmailMessage] = useState("");
    const [emailMessageColor,setEmailMessageColor] = useState("red")

    //비밀번호 수정
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [pwMessage,setPwMessage] = useState("")
    const [pwMessageColor,setPwMessageColor] = useState("red")
    const [isPwValid, setIsPwValid] = useState(false);
    const [isPwMatch, setIsPwMatch] = useState(false);

    //이름 검사
    const matchname = async () =>{
        if(!name.trim()){
            setnameMessage("이름을 입력해 주세요")
            setnameMessageColor("red");
            return;
        }
    
        const available = await nameMatch(name);
        if(available) {
            setNameCheck(true);
            setnameMessage("아이디를 입력해 주세요");
            setnameMessageColor("green")
        }else{
            setNameCheck(false);
            setnameMessage("존재하지 않는 사용자입니다")
            setnameMessageColor("red")
        }
    };

    //아이디 검사
    const matchId = async () => {
        if(!loginId.trim()){
            setIdMessage("아이디를 입력해 주세요")
            setIdMessageColor("red")
            return;
        }
        const available = await idMatch(name,loginId);
        if(available){
            setIdCheck(true);
            setIdMessage("이메일 인증을 완료해 주세요")
            setIdMessageColor("green")
        }else{
            setIdCheck(false);
            setIdMessage("존재하지 않는 아이디입니다")
            setIdMessageColor("red")
        }
    };

// 이메일 코드 발송
const handleSendCode = async () => {
  if (!name.trim() || !loginId.trim() || !email.trim()) {
    setEmailMessage("이름, 아이디, 이메일을 모두 입력해 주세요.");
    setEmailMessageColor("red");
    return;
  }

  try {
    const res = await axios.post("/api/auth/pw-send-code", null, {
      params: { name, loginId, email },
    });

    setCodeSent(true);
    setEmailMessage(res.data || "인증 코드가 이메일로 발송되었습니다✅.");
    setEmailMessageColor("green");
    setCooldown(15);

    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  } catch (err: any) {
    const msg = err.response?.data || "이름, 아이디, 이메일이 일치하지 않습니다.";

    setCodeSent(false);
    setEmailMessage(msg);
    setEmailMessageColor("red");

    if (msg.includes("계정으로 가입된 사용자입니다")) {
      setEmailVerified(false);
    }
  }
};

// 이메일 인증
const handleEmailVerify = async () => {
  try {
    await verifyEmail(email, verificationCode);
    setEmailVerified(true);
    setEmailMessage("이메일 인증이 완료되었습니다 ✅");
    setEmailMessageColor("green");
  } catch (err: any) {
    const msg = err.response?.data || "인증 코드가 틀리거나 만료되었습니다.";
    setEmailMessage(msg);
    setEmailMessageColor("red");
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


// 비밀번호 수정
const updatePW = async () => {
  if (!emailVerified) {
    setPwMessage("먼저 이메일 인증을 완료해 주세요");
    setPwMessageColor("red");
    return;
  }

  try {
    // ✅ params 방식으로 전달
    const res = await axios.put("/api/auth/updatePW", null, {
      params: { name, loginId, email, password },
    });

    const message: string = res.data;
    setPwMessage(message);

    if (message.includes("성공")) {
      setPwMessageColor("green");
    } else {
      setPwMessageColor("red");
    }
  } catch (err: any) {
    setPwMessage(err.response?.data || "비밀번호 수정 실패");
    setPwMessageColor("red");
  }
};


return (
  <div>
    <h2>비밀번호 찾기</h2>

    {/* 이름 */}
    {nameMessage && (
      <p style={{ color: nameMessageColor, fontSize: "13px", margin: "4px 0 0 0", textAlign: "right", }}>{nameMessage}</p>
    )}
    <div className={styles.inputCheck}>
      <input value={name} onChange={(e) => { setName(e.target.value); setNameCheck(false); setnameMessage(""); }} placeholder="이름을 입력해 주세요" required />
      <button type="button" onClick={matchname} disabled={namecheck}>확인</button>
    </div>

    {/* 아이디 (이름 확인 후 노출) */}
    {namecheck && (
      <>
        {idMessage && (
          <p style={{ color: idMessageColor, fontSize: "13px", margin: "4px 0 0 0", textAlign: "right", }} >{idMessage} </p>
        )}
        <div className={styles.inputCheck}>
          <input value={loginId} onChange={(e) => { setLoginId(e.target.value); setIdCheck(false); setIdMessage(""); setnameMessage(""); }}
            placeholder="아이디를 입력해 주세요"
            required/>
          <button type="button" onClick={matchId} disabled={idCheck}> 확인 </button>
        </div>
      </>
    )}

    {/* 이메일 입력 (아이디 확인 후 노출) */}
    {idCheck && (
    <>
    {emailMessage && (
      <p style={{ color: emailMessageColor, fontSize: "13px", margin: "4px 0 0 0", textAlign: "right", }}>{emailMessage} </p>
    )}
    <div className={styles.inputCheck}>
        <input value={email} onChange={(e) => { setEmail(e.target.value); setCodeSent(false); setCooldown(0); setEmailMessage(""); setEmailVerified(false); setIdMessage("")
        }} placeholder="이메일"/>
      <button type="button" onClick={handleSendCode} disabled={cooldown > 0}>
         {codeSent? (cooldown > 0   ? `재발송 (${Math.floor(cooldown / 60)}:${String(cooldown % 60).padStart(2, "0")})`   : "재발송"): "코드 발송"}
      </button>
    </div>

    {/* 코드 입력 → 소셜 로그인 계정이면 아예 안 보이게 */}
    {codeSent && !emailMessage.includes("계정으로 가입된 사용자입니다") && (
      <div className={styles.inputCheck}>
        <input value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} placeholder="인증 코드" disabled={emailVerified}/>
        <button type="button" onClick={handleEmailVerify} disabled={emailVerified}>
          {emailVerified ? "인증완료" : "확인"}
        </button>
      </div>
    )}
    </>
    )}

    {/* 비밀번호 변경 (이메일 인증 완료 후 노출) */}
    {emailVerified && !emailMessage.includes("계정으로 가입된 사용자입니다") && (
    <>
    {/* ✅ 비밀번호 변경 성공 시 → 완료 메시지만 표시 */}
    {pwMessage.includes("성공") ? (
      <p style={{ color: "green", fontSize: "14px", margin: "12px 0 0 0", textAlign: "center", fontWeight: "bold", }}>
      ✅ 비밀번호 변경이 완료되었습니다.</p>
    ) : (
      <>
        {/* 실패/진행 중일 때만 입력창과 메시지 보여줌 */}
        {passwordConfirm && !isPwMatch && (
          <p style={{ color: "red", fontSize: "13px", margin: "4px 0 0 0", textAlign: "right", }}>
            비밀번호가 일치하지 않습니다.
          </p>
        )}

        {pwMessage && ( <p style={{ color: pwMessageColor, fontSize: "13px", margin: "4px 0 0 0", textAlign: "right", }}>
            {pwMessage}
          </p>
        )}

        <div className={styles.inputCheck}>
          <input type="password" value={password} onChange={(e) => {setPassword(e.target.value); setEmailMessage("")}} placeholder="비밀번호"/>
          <input type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} placeholder="비밀번호 확인"/>
        </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
          <button className={styles.findBtn} type="button" onClick={updatePW} disabled={
            !(password && passwordConfirm && isPwMatch && isPwValid) ||
              pwMessage.includes("소셜 로그인")}>
          비밀번호 변경</button>
          </div>
      </>
    )}
  </>
)}
  </div>
    );
  }