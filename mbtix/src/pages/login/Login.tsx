import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";

import { Link, useNavigate, useSearchParams,} from "react-router-dom";
import { login } from "../../api/authApi";
import styles from "./login.module.css";
import Findid from "./FindId";
import mainIcon from "../../assets/main-page/메인아이콘.png"
import Modal from "../../components/FindModal";
import Findpw from "./Findpw";


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

  const [showFindId, setShowFindId] = useState(false);
  const [showFindPw, setShowFindPw] = useState(false);


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
      await login(loginId.trim().toLowerCase(), password, rememberMe);
      nav(redirect, { replace: true });
    } catch (error: any) {
      const msg =
        error?.response?.data || "아이디 또는 비밀번호가 올바르지 않습니다.";
      setErr(String(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleKakaoLogin = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    location.href = "http://52.65.147.249/api/oauth2/authorization/kakao";
  };


  return (
    <div className={styles.loginContainer}>
      <form onSubmit={handleSubmit}>
        <h1 className={styles.logo}><img src={mainIcon} /></h1>

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
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              autoComplete="current-password"
            />
          <div className={styles.checkboxRow}>
            <span>로그인 상태 유지</span>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
          </div>
        </div>

        <button type="submit" className={styles.loginBtn} disabled={!canSubmit}>
          {loading ? "로그인 중..." : "MBTI-X 로그인"}
        </button>

        <div className={styles.linkRow}>
          <Link to="/signup">회원가입</Link>
          <span onClick={() => setShowFindId(true)} className={styles.linkBtn}>
            아이디 찾기
          </span>
          <span onClick={() => setShowFindPw(true)} className={styles.linkBtn}>
            비밀번호 찾기
          </span>
        </div>

        <div className={styles.socialGroup}>
          <button
            className={`${styles.socialBtn} ${styles.kakao}`}
            onClick={handleKakaoLogin}
          >
            카카오로 로그인
          </button>
        </div>
      </form>

      {/* ✅ 모달은 form 밖에서 포털로 출력 */}
      {showFindId && (
        <Modal onClose={() => setShowFindId(false)}>
          <Findid />
        </Modal>
      )}

      {showFindPw && (
        <Modal onClose={() => setShowFindPw(false)}>
           <Findpw />
        </Modal>
      )}
    </div>
  );
};

export default LoginPage;
