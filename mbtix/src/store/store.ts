// 임시조치

import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/authSlice'; // 1. authSlice에서 reducer를 가져옵니다.

export const store = configureStore({
  // 2. reducer 객체 안에 authReducer를 등록합니다.
  reducer: {
    auth: authReducer, 
    // 나중에 다른 기능(slice)이 추가되면 여기에 계속 등록합니다.
    // 예: post: postReducer,
  },
});

// TypeScript를 위한 타입 정의 (RootState, AppDispatch)
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;