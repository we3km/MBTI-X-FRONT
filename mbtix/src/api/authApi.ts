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

// 인터셉터 설정 함수
export const setupAuthApiInterceptors = (appStore: typeof store) => {
  const getAccessToken = () => appStore.getState().auth.accessToken;
  const getUserId = () => appStore.getState().auth.userId;
  const getUser = (): User | null => appStore.getState().auth.user;

  // ===== request interceptor: Bearer 붙이기 =====
  authApi.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
      if (!config.headers) config.headers = new AxiosHeaders();
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
  });

  // ===== response interceptor: 401 -> refresh -> retry =====
  let isRefreshing = false;
  let waiters: Array<() => void> = [];

  authApi.interceptors.response.use(
    (res) => res,
    async (err: AxiosError) => {
      const original = err.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;
      const status = err.response?.status ?? 0;
      const url = original?.url ?? "";
      const isAuthCall = url.includes("/refresh") || url.includes("/login");

      if (status === 401 && original && !original._retry && !isAuthCall) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            waiters.push(() => authApi(original).then(resolve).catch(reject));
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

          appStore.dispatch(
            setAuth({
              accessToken,
              userId: uid,
              refreshToken,
              user: nextUser ?? null,
            })
          );

          waiters.forEach((fn) => fn());
          waiters = [];

          return authApi(original);
        } catch (refreshErr) {
          waiters = [];
          appStore.dispatch(logoutAction());
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(err);
    }
  );
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

export const refreshToken = async () => {
  const res = await authApi.post<AuthResult>("/refresh");
  return res.data;
};

export const bootstrapAuth = async () => {
  try {
    const { data } = await authApi.post<AuthResult>("/refresh");
    const uid = data.user?.userId ?? (store.getState().auth.userId ?? 0);
    const nextUser = data.user ?? store.getState().auth.user;

    store.dispatch(
      setAuth({
        accessToken: data.accessToken,
        userId: uid,
        refreshToken: data.refreshToken ?? null,
        user: nextUser ?? null,
      })
    );
  } catch {
    store.dispatch(logoutAction());
  }
};