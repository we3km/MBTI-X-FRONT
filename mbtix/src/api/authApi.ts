// src/api/authApi.ts
import axios from "axios";
import type { SignupRequest, AuthResult } from "../type/type";

const API_BASE = "http://localhost:8085/api/auth"; // 8085로 변경

// axios 인스턴스 생성
const authApi = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // 쿠키 전송
  headers: {
    "Content-Type": "application/json",
  },
});

// 회원가입
export const signup = async (data: SignupRequest): Promise<AuthResult> => {
  const response = await authApi.post("/signup", data);
  return response.data;
};

// 아이디 중복 확인
export const checkId = async (loginId: string) => {
  const response = await authApi.get("/checkId", {
    params: { loginId },
  });
  return response.data;
};

// 닉네임 중복 확인
export const checkNickname = async (nickname: string) => {
  const response = await authApi.get("/checkNickname", {
    params: { nickname },
  });
  return response.data;
};

// 이메일 인증 코드 발송
export const sendCode = async (email: string) => {
  const response = await authApi.post(
    "/send-code",
    null,
    { params: { email } }
  );
  return response.data;
};

// 이메일 인증 코드 확인
export const verifyEmail = async (email: string, code: string) => {
  const response = await authApi.post(
    "/verify-code",
    { email, code } // body로 전달
  );
  return response.data;
};

// 로그인
export const login = async (loginId: string, password: string) => {
  const response = await authApi.post("/login", { loginId, password });
  return response.data;
};

// 로그아웃
export const logout = async () => {
  const response = await authApi.post("/logout");
  return response.data;
};

// accessToken 재발급
export const refreshToken = async () => {
  const response = await authApi.post("/refresh");
  return response.data;
};
