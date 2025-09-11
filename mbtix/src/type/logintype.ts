// === API payloads ===
export interface SignupRequest {
  loginId: string;
  email: string;
  password: string;
  name: string;
  nickname: string;
  mbtiId: number;
  verificationCode: string;
  agree1: boolean;
  agree2: boolean;
  agree3: boolean;
}

export interface User {
  userId: number;
  email: string;
  name: string;
  nickname: string;
  mbtiId: number;
  mbtiName : string;
  profileFileName : string;
  point : number;
  roles: string;
}

// 백엔드 로그인/회원가입 응답 형식
export interface AuthResult {
  accessToken: string;
  // refreshToken은 쿠키만 쓰는 환경에선 안 내려올 수도 있으니 optional로 두는 게 안전
  refreshToken?: string;
  user: User;
}

// === Redux Auth state ===
// 슬라이스/인터셉터에서 사용하는 형태에 맞춤: token + userId + isAuthenticated
export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null; // 서버가 응답 안 주면 null 유지
  userId: number | null;
  isAuthenticated: boolean;
  user: User | null;
}

export const initialAuthState: AuthState = {
  accessToken: null,
  refreshToken: null,
  userId: null,
  isAuthenticated: false,
  user: null,
};

// setAuth 액션 payload 타입
export type SetAuthPayload = {
  accessToken?: string | null;
  userId: number;
  refreshToken?: string | null; // 없으면 기존 state 유지
  user?: User | null;
};