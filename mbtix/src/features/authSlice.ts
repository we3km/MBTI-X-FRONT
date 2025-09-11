import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {initialAuthState, type AuthState, type SetAuthPayload } from "../type/logintype";

const authSlice = createSlice({
  name: "auth",
  initialState: initialAuthState,
  reducers: {
    /** 로그인 / 토큰 갱신 시 */
    setAuth(state: AuthState, action: PayloadAction<SetAuthPayload>) {
      const { accessToken, userId, refreshToken } = action.payload;
      state.accessToken = accessToken ?? state.accessToken ?? null;
      state.userId = userId;
      // refreshToken이 오면 교체, 없으면 기존값 유지
      state.refreshToken = refreshToken ?? state.refreshToken ?? null;
      state.user = action.payload.user ?? state.user
      state.isAuthenticated = !!accessToken;
    },

    /** 로그아웃 */
    logout(state: AuthState) {
      state.accessToken = null;
      state.refreshToken = null;
      state.userId = null;
      state.isAuthenticated = false;
    },

    /** 전부 초기화 */
    clearAuth(state: AuthState) {
      state.accessToken = null;
      state.refreshToken = null;
      state.userId = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setAuth, logout, clearAuth } = authSlice.actions;
export default authSlice.reducer;
