import axios, { AxiosHeaders } from "axios";
import type { AxiosError, AxiosRequestConfig } from "axios";
import type { SignupRequest, AuthResult, User } from "../type/logintype";
import { store } from "../store/store";
import { setAuth, logout as logoutAction } from "../features/authSlice";

// const API_BASE = "http://192.168.10.230:8085/api/auth";
const API_BASE = "http://localhost:8085/api/auth";
// 테스트용

const getAccessToken = () => store.getState().auth.accessToken;
const getUserId = () => store.getState().auth.userId;
const getUser = (): User | null => store.getState().auth.user;

export const authApi = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
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

// ===== setupAuthApiInterceptors 함수 추가 =====
export const setupAuthApiInterceptors = () => {
  // 이미 인터셉터가 설정되어 있으므로 별도 작업 불필요
  // 필요시 추가 설정을 여기에 작성
  console.log('Auth API interceptors are already set up');
};

// ===== request interceptor: Bearer 토큰 붙이기 =====
authApi.interceptors.request.use((config) => {
  const token = getAccessToken();
  // permitAll 엔드포인트 + /refresh 요청에는 토큰 안 붙임
  const isNoAuthUrl =
    (config.url && noAuthUrls.some((url) => config.url?.startsWith(url))) ||
    config.url?.includes("/refresh");

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

authApi.interceptors.response.use(
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
              resolve(authApi(original));
            } else {
              reject(err);
            }
          });
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await authApi.post<AuthResult>("/refresh");
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
        return authApi(original);
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
  const res = await authApi.get<boolean>("/checkemail", { params: { email } });
  return res.data;
}

export const sendCode = async (email: string) => {
  const res = await authApi.post("/send-code", null, { params: { email } });
  return res.data;
};

export const verifyEmail = async (email: string, code: string) => {
  const res = await authApi.post("/verify-code", { email, code });
  return res.data;
};

export const nameMatch = async (name: string) => {
  const res = await authApi.get<boolean>("/namematch", { params: { name } })
  return res.data
}

export const idMatch = async (name: string, loginId: string) => {
  const res = await authApi.get<boolean>("/idmatch", { params: { name, loginId } })
  return res.data
}

export const login = async (
  loginId: string,
  password: string,
  rememberMe: boolean
) => {
  const res = await authApi.post<AuthResult>("/login", {
    loginId,
    password,
    rememberMe,
  });
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

export const refreshToken = async () => {
  const res = await authApi.post<AuthResult>("/refresh");
  return res.data;
};