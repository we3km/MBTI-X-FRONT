import { useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { setAuth } from "../../features/authSlice";

export default function SocialSignup() {
  const [nickname, setNickname] = useState("");
  const [mbtiId, setMbtiId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // 백엔드에서 redirect로 내려준 쿼리 파라미터 파싱
  const params = new URLSearchParams(location.search);
  const provider = params.get("provider") ?? "";
  const providerUserId = params.get("providerUserId") ?? "";
  const email = params.get("email") ?? ""; // 카카오/네이버에서 받은 이메일
  const name = params.get("name") ?? "";   // 카카오 프로필 닉네임
  const profileImageUrl = params.get("profileImageUrl") ?? "";
  const accessToken = params.get("accessToken") ?? "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await axios.post("http://localhost:8085/api/auth/social-signup", {
        loginId: email,  // 이메일을 loginId로 사용
        email,
        name,
        nickname,
        mbtiId,
        provider,
        providerUserId,
        accessToken,
        profileImageUrl,
      });

      // Redux 상태 저장
      dispatch(setAuth({
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
        userId: res.data.user.userId,
        user: res.data.user,
      }));

      navigate("/", { replace: true });
    } catch (err: any) {
      console.error(err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (typeof err.response?.data === "string") {
        setError(err.response.data);
      } else {
        setError("회원가입 실패");
      }
    }
  };

  // ✅ JSX 반드시 반환
  return (
    <div style={{ maxWidth: 400, margin: "50px auto" }}>
      <h2>소셜 회원가입</h2>
      <p>소셜 로그인 이메일: <b>{email}</b></p>
      <p>이름(프로필): <b>{name}</b></p>

      <form onSubmit={handleSubmit}>
        <div>
          <label>닉네임</label>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
          />
        </div>

        <div>
          <label>MBTI</label>
          <select value={mbtiId} onChange={(e) => setMbtiId(e.target.value)} required>
            <option value="">선택하세요</option>
            <option value="ENFP">ENFP</option>
            <option value="ISTJ">ISTJ</option>
            <option value="ENTP">ENTP</option>
            <option value="INFJ">INFJ</option>
            {/* TODO: MBTI 전체 타입 추가 */}
          </select>
        </div>

        {error && <div style={{ color: "red" }}>{error}</div>}

        <button type="submit">회원가입 완료</button>
      </form>
    </div>
  );
}
