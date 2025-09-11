import axios from "axios";
import { store } from "../store/store";

/** -------- Axios instance -------- */
const http = axios.create({
  baseURL: "http://localhost:8085/api", // 스프링부트 API 기본 경로
  timeout: 10000,
});

http.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token && token !== "null") {
    config.headers = config.headers ?? {};
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

/** -------- API 함수들 -------- */

// 질문 목록 가져오기
export async function getMbtiQuestions() {
  const res = await http.get("/mbti/questions");
  return res.data;
}

// 답변 전송 → 결과 받기
export async function submitMbtiAnswers(
  userId: number,
  answers: { questionId: number; choice: string }[]
) {
  const res = await http.post("/mbti/calculate", {
    userId,
    answers,
  });
  return res.data; // MBTI 문자열 (예: "ENFP")
}
