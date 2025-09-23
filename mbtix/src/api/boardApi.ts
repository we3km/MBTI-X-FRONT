import axios, { AxiosHeaders } from "axios";
import type { AxiosError, AxiosRequestConfig } from "axios";
import type { SignupRequest, AuthResult, User } from "../type/logintype";
import { store } from "../store/store";
import { setAuth, logout as logoutAction } from "../features/authSlice";

const getAccessToken = () => store.getState().auth.accessToken;
const getUserId = () => store.getState().auth.userId;
const getUser = (): User | null => store.getState().auth.user;

export const api =  axios.create({
    baseURL: 'http://localhost:8085/api',
    //withCredentials: true
    withCredentials: false
});

const noAuthUrls = [
  "/login",
  "/signup",
  "/logout",
  "/refresh",
  "/checkId",
  "/checkNickname",
  "/send-code",
  "/verify-code",
  "/checkemail",
];


// ===== request interceptor: Bearer 토큰 붙이기 =====
api.interceptors.request.use((config) => {
  const token = getAccessToken();

  // permitAll 엔드포인트에는 토큰 안 붙임
  const isNoAuthUrl = noAuthUrls.some((url) =>
    config.url?.startsWith(url)
  );

  if (!isNoAuthUrl && token) {
    if (!config.headers) {
      config.headers = new AxiosHeaders();
    }
    (config.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`);
  }

  return config;
});
 
// ===== response interceptor: 401 발생 시 refresh 시도 후 재요청 =====
let isRefreshing = false;
let waiters: Array<(token?: string) => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const original = err.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = err.response?.status ?? 0;
    const url = original?.url ?? "";

    // 로그인/회원가입/인증 관련 요청은 refresh 로직 제외
    const isAuthCall = noAuthUrls.some((u) => url.includes(u));

    if (status === 401 && original && !original._retry && !isAuthCall) {
      if (isRefreshing) {
        // 이미 refresh 중이면 큐에 쌓았다가 끝나면 다시 시도
        return new Promise((resolve, reject) => {
          waiters.push((newToken) => {
            if (newToken) {
              if (!original.headers) original.headers = new AxiosHeaders();
              (original.headers as AxiosHeaders).set("Authorization", `Bearer ${newToken}`);
              resolve(api(original));
            } else {
              reject(err);
            }
          });
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post<AuthResult>("/refresh");
        const accessToken = data.accessToken;
        const refreshToken = data.refreshToken ?? null;
        const nextUser = data.user ?? getUser();
        const uid = (data.user?.userId ?? getUserId() ?? 0);

        // 새 토큰 저장
        store.dispatch(
          setAuth({
            accessToken,
            refreshToken,
            userId: uid,
            user: nextUser ?? null,
          })
        );

        // 대기중인 요청들 재시도
        waiters.forEach((cb) => cb(accessToken));
        waiters = [];

        if (!original.headers) original.headers = new AxiosHeaders();
        (original.headers as AxiosHeaders).set("Authorization", `Bearer ${accessToken}`);

        return api(original);
      } catch (refreshErr) {
        waiters.forEach((cb) => cb(undefined));
        waiters = [];
        store.dispatch(logoutAction());
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);