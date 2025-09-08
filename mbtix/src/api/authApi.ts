// src/api/authApi.ts

import axios, { AxiosHeaders } from "axios";
import type { AxiosError, AxiosRequestConfig } from "axios";
import type { SignupRequest, AuthResult, User } from "../type/logintype";
import { store } from "../store/store";
import { setAuth, logout as logoutAction } from "../features/authSlice";

const API_BASE = "http://localhost:8085/api/auth";

export const authApi = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// 인터셉터 설정 함수 (순환 참조 해결)
export const setupAuthApiInterceptors = (appStore: typeof store) => {
  const getAccessToken = () => appStore.getState().auth.accessToken;

  authApi.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
      if (!config.headers) config.headers = new AxiosHeaders();
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
  });

};

// =============== API functions ===============
export const signup = async (data: SignupRequest): Promise<AuthResult> => {
  const res = await authApi.post<AuthResult>("/signup", data);
  return res.data;
};

export const checkId = async (loginId: string) => {
  const res = await authApi.get<boolean>("/checkId", { params: { loginId } });
  return res.data;
};

export const checkNickname = async (nickname: string) => {
  const res = await authApi.get<boolean>("/checkNickname", { params: { nickname } });
  return res.data;
};

export const checkEmail = async (email: string) => {
  const res = await authApi.get<boolean>("/checkEmail", { params: { email } });
  return res.data;
};

export const sendCode = async (email: string) => {
  const res = await authApi.post("/send-code", null, { params: { email } });
  return res.data;
};

export const verifyEmail = async (email: string, code: string) => {
  const res = await authApi.post("/verify-code", { email, code });
  return res.data;
};

export const login = async (loginId: string, password: string) => {
  const res = await authApi.post<AuthResult>("/login", { loginId, password });
  const { accessToken, refreshToken, user } = res.data;
  store.dispatch(
    setAuth({
      accessToken,
      userId: user.userId,
      refreshToken: refreshToken ?? null,
      user,
    })
  );
  return res.data;
};

export const doLogout = async () => {
  try {
    await authApi.post("/logout");
  } finally {
    store.dispatch(logoutAction());
  }
};