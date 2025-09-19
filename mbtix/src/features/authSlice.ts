import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { initialAuthState, type AuthState, type SetAuthPayload } from "../type/logintype";

const authSlice = createSlice({
  name: "auth",
  initialState: initialAuthState,
  reducers: {
    /** 로그인 / 토큰 갱신 시 */
    setAuth(state: AuthState, action: PayloadAction<SetAuthPayload>) {
      const { accessToken, userId, refreshToken, user, retestAllowed } = action.payload; // ✅ retestAllowed도 구조 분해

      state.accessToken = accessToken ?? state.accessToken ?? null;
      state.userId = userId;
      state.refreshToken = refreshToken ?? state.refreshToken ?? null;
      state.user = user ?? state.user;
      state.isAuthenticated = !!accessToken;

      if (retestAllowed !== undefined) {
        state.retestAllowed = retestAllowed; // ✅ 정상 반영
      }
    },

    /** 로그아웃 */
    logout(state: AuthState) {
      state.accessToken = null;
      state.refreshToken = null;
      state.userId = null;
      state.user = null;
      state.isAuthenticated = false;
      state.retestAllowed = false; // ✅ 초기화
    },

    /** 전부 초기화 */
    clearAuth(state: AuthState) {
      state.accessToken = null;
      state.refreshToken = null;
      state.userId = null;
      state.user = null;
      state.isAuthenticated = false;
      state.retestAllowed = false; // ✅ 초기화
    },
  },
});

export const { setAuth, logout, clearAuth } = authSlice.actions;
export default authSlice.reducer;
