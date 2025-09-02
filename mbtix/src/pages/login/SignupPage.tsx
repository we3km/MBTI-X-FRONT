import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setAuth } from "../../features/authSlice";
import { signup, checkId, checkNickname, sendCode, verifyEmail } from "../../api/authApi"; 
import type { SignupRequest } from "../../type/logintype";

const SignupPage: React.FC = () => {
  const dispatch = useDispatch();

  const [loginId, setLoginId] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [name, setName] = useState("");
  const [mbtiId, setMbti] = useState("");

  const [agree1, setAgree1] = useState(false);
  const [agree2, setAgree2] = useState(false);
  const [agree3, setAgree3] = useState(false);

  const [codeSent, setCodeSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const allAgreed = agree1 && agree2 && agree3;

  // 아이디 중복 확인
const handleIdCheck = async () => {
  try {
    const id = loginId.trim();
    if (!id) return alert("아이디를 입력해 주세요.");

    const available = await checkId(id);
    alert(available ? "사용 가능한 아이디입니다." : "이미 존재하는 아이디입니다.");
  } catch (err: any) {
    alert(err.response?.data || "아이디 확인 중 오류가 발생했습니다.");
  }
};

  // 닉네임 중복 확인
  const handleNicknameCheck = async () => {
    try {
      const nick = nickname.trim();
      if(!nickname) return alert("닉네임을 입력해 주세요.");
      
      const available = await checkNickname(nick);
      alert(available ? "사용 가능한 닉네임입니다." : "이미 존재하는 닉네임입니다.");
  }catch(err:any) {
    alert(err.response?.data || "닉네임 확인 중 오류가 발생했습니다.");
  }
  };

  // 이메일 인증 코드 발송
  const handleSendCode = async () => {
    try {
      await sendCode(email);
      setCodeSent(true);
      alert("인증 코드가 발송되었습니다.");
    } catch (err: any) {
      alert(err.response?.data || "인증 코드 발송 실패");
    }
  };

  // 이메일 인증 확인
  const handleEmailVerify = async () => {
    try {
      await verifyEmail(email, verificationCode);
      setEmailVerified(true);
      alert("이메일 인증 완료");
    } catch (err: any) {
      alert(err.response?.data || "인증 코드가 틀리거나 만료됨");
    }
  };

  // 회원가입
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!allAgreed) return alert("모든 약관에 동의해야 합니다.");
    if (!emailVerified) return alert("이메일 인증을 완료해야 합니다.");
    if (password !== passwordConfirm) return alert("비밀번호가 일치하지 않습니다.");

    const signupData: SignupRequest = {
      loginId,
      nickname,
      email,
      password,
      name,
      mbtiId: Number(mbtiId),
      verificationCode,
      agree1,
      agree2,
      agree3,
    };

    try {
      const result = await signup(signupData);
      dispatch(
        setAuth({
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          userId: result.user.userId,
        })
      );
      alert("회원가입 완료!");
    } catch (err: any) {
      alert(err.response?.data || "회원가입 실패");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>회원가입</h2>

      {/* 약관 */}
      <div>
        <label><input type="checkbox" checked={agree1} onChange={() => setAgree1(!agree1)} /> 약관 1</label>
        <label><input type="checkbox" checked={agree2} onChange={() => setAgree2(!agree2)} /> 약관 2</label>
        <label><input type="checkbox" checked={agree3} onChange={() => setAgree3(!agree3)} /> 약관 3</label>
      </div>

      {/* 아이디 & 닉네임 */}
      <div className="input-check">
        <input value={loginId} onChange={e => setLoginId(e.target.value)} placeholder="아이디" />
        <button type="button" onClick={handleIdCheck}>중복 확인</button>
      </div>
      <div className="input-check">
        <input value={nickname} onChange={e => setNickname(e.target.value)} placeholder="닉네임" />
        <button type="button" onClick={handleNicknameCheck}>중복 확인</button>
      </div>

      {/* 이메일 */}
      <div className="email-input">
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="이메일" />
        <button type="button" onClick={handleSendCode} disabled={codeSent}>인증 코드 발송</button>
      </div>

      {/* 인증 코드 */}
      {codeSent && (
        <div className="emali-check">
          <input value={verificationCode} onChange={e => setVerificationCode(e.target.value)} placeholder="인증 코드" />
          <button type="button" onClick={handleEmailVerify} disabled={emailVerified}>확인</button>
        </div>
      )}

      {/* 비밀번호 */}
      <div className="input-password">
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="비밀번호" />
        <input type="password" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} placeholder="비밀번호 확인" />
      </div>

      {/* 이름, MBTI */}
      <div className="input-nambti">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="이름" />
        <input value={mbtiId} onChange={e => setMbti(e.target.value)} placeholder="MBTI" />
      </div>

      <button type="submit" disabled={!allAgreed || !emailVerified}>회원가입</button>
    </form>
  );
};

export default SignupPage;
