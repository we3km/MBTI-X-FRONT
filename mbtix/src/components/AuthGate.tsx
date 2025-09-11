// AuthGate.tsx
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setAuth, logout } from "../features/authSlice";
import { authApi } from "../api/authApi";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    authApi.post("/refresh")
      .then(res => {
        dispatch(setAuth({
          accessToken: res.data.accessToken,
          userId: res.data.user?.userId ?? 0,
          user: res.data.user ?? null,
        }));
      })
      .catch(() => {
        dispatch(logout());
      })
      .finally(() => {
        setReady(true); // ✅ refresh 시도 끝난 뒤에만 화면 보여주기
      });
  }, [dispatch]);

  if (!ready) return <div>로딩 중...</div>; // 또는 스피너
  return <>{children}</>;
}
