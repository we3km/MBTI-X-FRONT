// src/pages/LoginPage.tsx
import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";

import { Link, useNavigate, useSearchParams,} from "react-router-dom";
import { login } from "../../api/authApi";
import styles from "./login.module.css";

const LoginPage: React.FC = () => {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/";

  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const canSubmit = useMemo(
    () => loginId.trim().length > 0 && password.length > 0 && !loading,
    [loginId, password, loading]
  );

  React.useEffect(() => {
    if (isAuthenticated) nav(redirect, { replace: true });
  }, [isAuthenticated, redirect, nav]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setErr(null);
    setLoading(true);
    try {
      // 백엔드가 소문자 규칙이라면 아래처럼 통일

      await login(loginId.trim().toLowerCase(), password,rememberMe);
      nav(redirect, { replace: true });
    } catch (error: any) {
      const msg = error?.response?.data || "아이디 또는 비밀번호가 올바르지 않습니다.";
      setErr(String(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleKakaoLogin = () => {

  }
  const handleNaverLogin =() => {

  }

return (
  <div className={styles.loginContainer}>
    <form onSubmit={handleSubmit}>
      <h1>MBTI-X</h1>

      {err && <div className={styles.errorMsg}>{err}</div>}

      <div className={styles.formGroup}>
        <label>아이디</label>
        <input
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
          placeholder="아이디"
          autoComplete="username"
        />
      </div>

      <div className={styles.formGroup}>
        <label>비밀번호</label>
        <div className={styles.passwordWrapper}>
          <input
            type={"password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            autoComplete="current-password"
          />
        </div>
        <div className={styles.checkboxRow}>
          <span>로그인 상태 유지</span>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
        </div>
      </div>

      <button
        type="submit"
        className={styles.loginBtn}
        disabled={!canSubmit}
      >
        {loading ? "로그인 중..." : "MBTI-X 로그인"}
      </button>

      <div className={styles.linkRow}>
        <Link to="/signup">회원가입</Link>
        <Link to="/find-id">아이디 찾기</Link>
        <Link to="/find-pw">비밀번호 찾기</Link>
      </div>
       <div className={styles.socialGroup}>
          <button className={`${styles.socialBtn} ${styles.kakao}`} onClick={handleKakaoLogin}>카카오로 로그인</button>
          <button className={`${styles.socialBtn} ${styles.naver}`} onClick={handleNaverLogin}>네이버로 로그인</button>
       </div>
        <div>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
