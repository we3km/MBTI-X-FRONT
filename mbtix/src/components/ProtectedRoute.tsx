import type { ReactNode } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";

interface Props {
    children: ReactNode;
    requiredRoles?: string[];
    redirectTo?: string;
}
export default function ProtectedRoute({
  children,
  requiredRoles = [],
  redirectTo = "/login"
}: Props) {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  // 로그인하지 않은 경우
  if (!isAuthenticated) {
    alert("로그인 후 이용해주세요.");
    return <Navigate to={redirectTo} replace />;
  }
  // roles 배열 안전하게 처리
  const roles: string[] = Array.isArray(user?.roles)
    ? user.roles
    : user?.roles
      ? [user.roles]   // 단일 string이면 배열로 감싸기
      : [];            // undefined면 빈 배열
  // 권한 검사
  if (requiredRoles.length > 0 && !roles.some((role: string) => requiredRoles.includes(role))) {
    alert("접근 권한이 없습니다.");
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}