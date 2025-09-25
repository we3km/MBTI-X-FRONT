import { useRef, type ReactNode } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { Navigate, Outlet } from "react-router-dom";
import toast from "react-hot-toast";
interface Props {
  children?: ReactNode;
  requiredRoles?: string[];
  redirectTo?: string;
}
export default function ProtectedRoute({
  children,
  requiredRoles = [],
  redirectTo = "/"
}: Props) {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const hasShownToast = useRef(false);

  if (!isAuthenticated) {
    if (!hasShownToast.current) {
      toast.error("로그인 후 이용 가능합니다.");
      hasShownToast.current = true;
    }
    return <Navigate to={redirectTo} replace />;
  }

  const roles: string[] = Array.isArray(user?.roles)
    ? user.roles
    : user?.roles
      ? [user.roles]
      : [];

  if (requiredRoles.length > 0 && !roles.some((role: string) => requiredRoles.includes(role))) {
    toast.error("접근 권한이 없습니다.");
    return <Navigate to="/" replace />;
  }

  // 여기서 children 없으면 Outlet 렌더링
  return <>{children ?? <Outlet />}</>;
}
