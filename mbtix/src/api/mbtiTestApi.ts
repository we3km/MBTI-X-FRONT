import axios from "axios";
import { store } from "../store/store";

/** -------- Axios instance -------- */
const http = axios.create({
  baseURL: "http://localhost:8085/api", // 스프링부트 API 기본 경로
  // baseURL: import.meta.env.VITE_API_BASE_URL, // 스프링부트 API 기본 경로
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

export type MbtiDetailRes = {
  type: string;
  ratios: {
    EI: { E: number; I: number };
    SN: { S: number; N: number };
    TF: { T: number; F: number };
    JP: { J: number; P: number };
  };
};

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

// ✅ 사용자 MBTI 비율 가져오기
export async function getMbtiRatio(userId: number) {
  const res = await http.get(`/mbti/ratio/${userId}`);
  return res.data as { mbtiName: string; ratio: number };
}

// MBTI 답변 제출 → 결과 + 지표 비율 함께 받기
export async function submitMbtiAnswersDetail(
  userId: number,
  answers: { questionId: number; choice: string }[]
) {
  const res = await http.post(`/mbti/calculate-detail`, {
    userId,
    answers,
  });
  return res.data as MbtiDetailRes;
}



