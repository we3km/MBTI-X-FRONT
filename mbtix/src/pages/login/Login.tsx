// src/pages/LoginPage.tsx
import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { login } from "../../api/authApi";

const LoginPage: React.FC = () => {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/";

  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [caps, setCaps] = useState(false);
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

  const onPwKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (typeof e.getModifierState === "function") setCaps(e.getModifierState("CapsLock"));
  };

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-2xl shadow p-6 space-y-5"
      >
        <h1 className="text-2xl font-semibold">로그인</h1>

        {err && (
          <div className="text-sm bg-red-50 text-red-700 rounded p-3">
            {err}
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm text-gray-700">아이디</label>
          <input
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            placeholder="아이디"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoComplete="username"
            inputMode="email"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm text-gray-700">비밀번호</label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyUp={onPwKeyUp}
              placeholder="비밀번호"
              className="w-full border rounded-lg px-3 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500"
            >
              {showPw ? "숨기기" : "표시"}
            </button>
            <label>
        <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
        />
        로그인 상태 유지
        </label>
          </div>
          {caps && (
            <p className="text-xs text-amber-600">Caps Lock이 켜져 있습니다.</p>
          )}
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className={`w-full rounded-lg py-2 font-medium text-white ${
            canSubmit ? "bg-indigo-600 hover:bg-indigo-700" : "bg-indigo-300"
          }`}
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>

        <div className="text-sm text-center text-gray-600">
          아직 계정이 없으신가요?{" "}
          <Link to="/signup" className="text-indigo-600 hover:underline">
            회원가입
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
