import { useState } from "react";
import axios from "axios";
import { nameMatch , verifyEmail } from "../../api/authApi";
import styles from "./Find.module.css";

export default function Findid() {
  const [name, setName] = useState(""); 
  const [message, setMessage] = useState(""); 
  const [messageColor, setMessageColor] = useState("red"); 
  
  const [codeSent, setCodeSent] = useState(false); 
  const [cooldown, setCooldown] = useState(0); 
  const [verificationCode, setVerificationCode] = useState(""); 
  const [emailVerified, setEmailVerified] = useState(false); 
  const [email, setEmail] = useState("");
  

  const [nameMessage, setnameMessage] = useState("");
  const [nameMessageColor, setnameMessageColor] = useState("red");
  const [namecheck,setNameCheck] = useState(false)

  const [foundId, setFoundId] = useState<string | null>(null); // 최종 결과 (마스킹된 아이디 or 소셜 안내)

  const matchname = async () =>{
    if(!name.trim()){
        setnameMessage("이름을 입력해 주세요")
        setnameMessageColor("red");
        return;
    }

    const available = await nameMatch(name);
    if(available) {
        setNameCheck(true);
        setnameMessage("이메일 인증을 완료해 주세요");
        setnameMessageColor("green")
    }else{
        setNameCheck(false);
        setnameMessage("존재하지 않는 사용자입니다")
        setMessageColor("red")
    }
  };


  // 이메일 코드 발송
  const handleSendCode = async () => {
    if (!name.trim() || !email.trim()) {
      setMessage("이름과 이메일을 입력해 주세요.");
      setMessageColor("red");
      return;
    }

    try {
      // 이름+이메일 일치 확인 & 인증코드 발송 API
      await axios.post("http://localhost:8085/api/auth/send-code-if-match", null, {
        params: { name, email },
      });

      setCodeSent(true);
      setMessage("인증 코드가 이메일로 발송되었습니다.");
      setMessageColor("green");
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
    } catch (err: any) {
      setMessage(err.response?.data || "이름과 이메일이 일치하지 않습니다.");
      setMessageColor("red");
    }
  };

  // 이메일 인증
  const handleEmailVerify = async () => {
    try {
      await verifyEmail(email, verificationCode);
      setEmailVerified(true);
      setMessage("이메일 인증이 완료되었습니다 ✅");
      setMessageColor("green");
    } catch (err: any) {
      setMessage(err.response?.data || "인증 코드가 틀리거나 만료되었습니다.");
      setMessageColor("red");
      setEmailVerified(false);
    }
  };

  // 아이디 찾기
  const handleFindId = async () => {
    if (!emailVerified) {
      setMessage("먼저 이메일 인증을 완료해 주세요.");
      setMessageColor("red");
      return;
    }

    try {
      const res = await axios.get("http://localhost:8085/api/auth/find-id", {
        params: { name, email},
      });
      setFoundId(res.data); // 마스킹된 아이디 or 소셜 안내 메시지
    } catch (err: any) {
      setMessage(err.response?.data || "아이디 찾기 실패");
      setMessageColor("red");
    }
  };

  return (
    <div className={styles.signupBox}>
      <h2>아이디 찾기</h2>

      {/* 이름 입력 */}
      { nameMessage && <p style={{ color: nameMessageColor, fontSize: "13px",margin: "4px 0 0 0",textAlign: "right"  }}>{nameMessage}</p> }
      <div className={styles.inputCheck}>
        <input value={name} onChange={e => {setName(e.target.value); setNameCheck(false); setnameMessage("")}} placeholder="이름을 입력해 주세요" required/>
        <button type="button" onClick={matchname} disabled={namecheck}>확인</button>
      </div>
      

      {/* 이메일 입력 */}
      {message && (
        <p style={{ color: messageColor, fontSize: "13px", margin: "4px 0 0 0", textAlign: "right", }}>{message}</p>
      )}
      <div className={styles.inputCheck}>
        <input value={email} onChange={e => { setEmail(e.target.value); setCodeSent(false); setCooldown(0); setMessage(""); setnameMessage(""); setEmailVerified(false);
      }}placeholder="이메일"/>
        <button type="button" onClick={handleSendCode} disabled={cooldown > 0}>
           {codeSent? (cooldown > 0   ? `재발송 (${Math.floor(cooldown / 60)}:${String(cooldown % 60).padStart(2, "0")})`   : "재발송"): "코드 발송"}
        </button>
      </div>

      {/* 코드 입력 */}
      {codeSent && (
        <div className={styles.inputCheck}>
          <input value={verificationCode} onChange={e => setVerificationCode(e.target.value)} placeholder="인증 코드" disabled={emailVerified} />
          <button type="button" onClick={handleEmailVerify} disabled={emailVerified} >
            {emailVerified ? "인증완료" : "확인"}
          </button>
        </div>
      )}

      {/* 아이디 찾기 실행 */}
      {emailVerified && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
          <button className={styles.findBtn} type="button" onClick={handleFindId}>아이디 확인</button>
        </div>
      )}

      {/* 최종 결과 출력 */}
      {foundId && (
        <div className={styles.resultBox}><p>{foundId}</p></div>
      )}
    </div>
  );
}
