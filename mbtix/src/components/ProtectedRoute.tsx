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

    // 로그인하지 않은 경우, 무조건 로그인 페이지로 보내기
    if (!isAuthenticated) {
        toast.error("로그인 후 이용해주세요.");
        return <Navigate to={redirectTo} replace />;
    }

    if (requiredRoles.length > 0 && !user?.roles?.some(role => requiredRoles.includes(role))) {
        toast.error("접근 권한이 없습니다.");
        return <Navigate to="/" replace />;
    }

    // 위의 모든 검사를 통과한 경우에만 페이지를 보여줌
    return <>{children}</>;
}