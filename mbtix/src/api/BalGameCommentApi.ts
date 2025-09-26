import axios from "axios";
import { store } from "../store/store";


const http = axios.create({
  baseURL: "/api", // 스프링 부트 프록시 경로
  // baseURL: import.meta.env.VITE_API_BASE_URL, // 스프링 부트 프록시 경로
  timeout: 10000
});

http.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token && token !== "null") {
    config.headers = config.headers ?? {};
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});




export type BalComment = {
  commentId: number;
  balId: number;
  userId: number;
  userName: string;
  mbti: string;
  content: string;
  createAt: string;
};


// 댓글 목록 조회
export const getComments = async (balId: number): Promise<BalComment[]> => {
  const res = await http.get(`/balance/comments/${balId}`);
  return res.data;
};

// 댓글 작성
export const postComment = async (
  balId: number,
  userId: number,
  content: string
) => {
  await http.post(`/balance/comments`, { balId, userId, content });
};

export const deleteComment = async (commentId: number, userId: number) => {
  await http.delete(`/balance/comments/${commentId}`, {  // ✅ commentId 경로에 포함
    params: { userId },
  });
};