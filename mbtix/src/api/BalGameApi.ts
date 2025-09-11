// src/api/BalGameApi.ts
import axios from "axios";
import { store } from "../store/store";


/** -------- Axios instance -------- */
const http = axios.create({
  baseURL: "http://localhost:8085/api", // 스프링 부트 프록시 경로
  timeout: 10000
});
http.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});


/** 공통 응답 헬퍼 */
const j = <T>(p: Promise<{ data: T; status: number }>) =>
  p.then((r) => (r.status === 204 ? (null as T) : r.data));

/** -------- API -------- */
export async function getToday(): Promise<TodayGameRes | null> {
  return j(http.get<TodayGameRes>("/balance/today"));
}

export async function postVote(gameId: number, option: OptionKey): Promise<void> {
  await http.post(`/balance/${gameId}/vote`, { option });
}

export async function getStats(gameId: number): Promise<StatsRes> {
  return j(http.get<StatsRes>(`/balance/${gameId}/stats`));
}

export async function getPast(page: number, size: number) {
  const r = await http.get(`/balance/past?page=${page}&size=${size}`);
  return r.data;
}

export async function postCreateGame(req: CreateGameReq): Promise<CreateGameRes> {
  return j(http.post<CreateGameRes>("/balance", req));
}






/** (선택) 과거 목록까지 여기로 통합하고 싶으면 활성화
export async function getPast(page = 1, size = 8): Promise<PastListRes> {
  return j(http.get<PastListRes>(`/balance/past?page=${page}&size=${size}`));
}
*/
/** -------- Types -------- */
export type OptionKey = "A" | "B";

export type TodayGameRes = {
  gameId: number;
  title: string;
  options: { label: OptionKey;  textContent: string; votes: number }[];
  myVote: OptionKey | null;
};

export type StatsRes = {
  gameId: number;
  totalVotes: number;
  options: Record<string, { textContent: string; cnt: number; ratio: number;  }>;
  mbti: { [label: string]: { [code: string]: { cnt: number; ratio: number } } };
};

export type PastCard = { 
  gameId: number; 
  title: string; 
  startAt: string 

};


export type PastListRes = {
  content: PastCard[];
  page: number;
  size: number;
  totalPages: number;
};

// ✅ 새 게임 생성 요청/응답 타입
export type CreateGameReq = {
  title: string;
  optionAText: string;
  optionBText: string;
};

export type CreateGameRes = {
  gameId: number;
  title: string;
};
