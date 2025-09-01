import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userId: number | null;
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  userId: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // 로그인 / 토큰 갱신 시
    setAuth(state, action: PayloadAction<{ accessToken: string; refreshToken: string; userId: number }>) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.userId = action.payload.userId;
    },
    // 로그아웃 시
    logout(state) {
      state.accessToken = null;
      state.refreshToken = null;
      state.userId = null;
    },
    // 기존 clearAuth와 동일
    clearAuth(state) {
      state.accessToken = null;
      state.refreshToken = null;
      state.userId = null;
    },
  },
});

export const { setAuth, logout, clearAuth } = authSlice.actions;
export default authSlice.reducer;
