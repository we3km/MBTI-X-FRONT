import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import { setAuth } from "../../features/authSlice";
import { authApi } from "../../api/authApi";

export default function OAuth2Success() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const accessToken = params.get("accessToken");
    if (!accessToken) {
      navigate("/login", { replace: true });
      return;
    }

    // ✅ 사용자 정보 불러오기 (백엔드에서 토큰 기반 조회)
    authApi
      .get("/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((res) => {
        dispatch(
          setAuth({
            accessToken,
            refreshToken: null, // 쿠키에 있으므로 프론트에서는 null 처리
            userId: res.data.userId,
            user: res.data,
          })
        );

        // 원하는 페이지로 이동
        navigate("/", { replace: true });
      })
      .catch(() => {
        navigate("/login", { replace: true });
      });
  }, [params, dispatch, navigate]);

  return <div>소셜 로그인 처리 중...</div>;
}
