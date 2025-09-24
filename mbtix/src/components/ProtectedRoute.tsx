import type { ReactNode } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { Navigate } from "react-router-dom";
interface Props {
  children: ReactNode;
  requiredRoles?: string[];
  redirectTo?: string;
}
export default function ProtectedRoute({
  children,
  requiredRoles = [],
  redirectTo = "/"
}: Props) {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const roles: string[] = Array.isArray(user?.roles)
    ? user.roles
    : user?.roles
      ? [user.roles]  
      : [];            

  if (requiredRoles.length > 0 && !roles.some((role: string) => requiredRoles.includes(role))) {
    alert("접근 권한이 없습니다.");
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}