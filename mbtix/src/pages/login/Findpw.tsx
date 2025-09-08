import { useState } from "react";
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
            setnameMessage("이메일 인증을 완료해 주세요");
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
        const available = await idMatch(loginId);
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
        if (!name.trim() || !email.trim()) {
        setEmailMessage("이름과 이메일을 입력해 주세요.");
        setEmailMessageColor("red");
        return;
        }

        try {
        // 이름+아이디+이메일 일치 확인 & 인증코드 발송 API
        await axios.post("http://localhost:8085/api/auth/pw-send-code", null, {
            params: { loginId ,name, email },
        });

        setCodeSent(true);
        setEmailMessage("인증 코드가 이메일로 발송되었습니다.");
        setEmailMessageColor("green");
        setCooldown(180); // 3분

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
        setEmailMessage(err.response?.data || "이름과 이메일이 일치하지 않습니다.");
        setEmailMessageColor("red");
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
        setEmailMessage(err.response?.data || "인증 코드가 틀리거나 만료되었습니다.");
        setEmailMessageColor("red");
        setEmailVerified(false);
      }
    };

   return (
  <div>
    <h2>비밀번호 찾기</h2>

    {/* 이름 */}
    {nameMessage && ( <p style={{color: nameMessageColor,fontSize: "13px",margin: "4px 0 0 0",textAlign: "right",}}>{nameMessage}</p>)}
    <div className={styles.inputCheck}>
      <input value={name}onChange={(e) => {setName(e.target.value);setNameCheck(false);setnameMessage("");}} placeholder="이름을 입력해 주세요" required/>
      <button type="button" onClick={matchname} disabled={namecheck}>확인</button>
    </div>

    {/* 아이디 */}
    {idMessage && (<p style={{ color: idMessageColor, fontSize: "13px", margin: "4px 0 0 0", textAlign: "right",}}>{idMessage}</p>)}
    <div className={styles.inputCheck}>
      <input value={loginId} onChange={(e) => { setLoginId(e.target.value); setIdCheck(false); setIdMessage(""); }} placeholder="아이디를 입력해 주세요" required/>
      <button type="button" onClick={matchId} disabled={idCheck}>확인</button>
    </div>

    {/* 이메일 입력 */}
    {emailMessage && ( <p style={{ color: emailMessageColor, fontSize: "13px", margin: "4px 0 0 0", textAlign: "right",}}> {emailMessage} </p>)}
    <div className={styles.inputCheck}>
      <input value={email} onChange={(e) => { setEmail(e.target.value); setCodeSent(false); setCooldown(0); setEmailMessage(""); setEmailVerified(false); }} placeholder="이메일"/>
      <button type="button" onClick={handleSendCode} disabled={cooldown > 0}>
        {cooldown > 0
          ? `재발송 (${Math.floor(cooldown / 60)}:${String(cooldown % 60).padStart(2, "0")})`
          : "코드 발송"}
      </button>
    </div>
    {/* 코드 입력 */}
    {codeSent && (
      <div className={styles.inputCheck}>
        <input value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} placeholder="인증 코드" disabled={emailVerified} />
        <button type="button" onClick={handleEmailVerify} disabled={emailVerified}>
        {emailVerified ? "인증완료" : "확인"}
        </button>
      </div>
    )}
  </div>
);
}