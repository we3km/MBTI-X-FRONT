export interface SignupRequest {
  loginId: string;
  email: string;
  password: string;
  name: string;
  nickname: string;
  mbtiId: number;
  verificationCode: string;
  agree1:boolean;
  agree2:boolean;
  agree3:boolean;
}

export interface User {
  userId: number;
  email: string;
  name: string;
  nickname: string;
  mbtiId: number;
}

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: User;
}