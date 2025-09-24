import axios from "axios";
import { store } from "../store/store";

/** -------- Axios instance -------- */
const http = axios.create({
  // baseURL: "http://localhost:8085/api",
  baseURL: import.meta.env.VITE_API_BASE_URL,
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

// 현재 로그인한 사용자 정보 (권한 포함)
export async function getMe(): Promise<{ userId: string; roles: string[] }> {
  return j(http.get<{ userId: string; roles: string[] }>("/balance/me"));
}


// 오늘의 게임 (페이징)
export async function getToday(page = 1, size = 1): Promise<TodayListRes> {
  return j(
    http.get<TodayListRes>(`/balance/today?page=${page}&size=${size}`)
  );
}

// 투표
export async function postVote(gameId: number, option: OptionKey): Promise<void> {
  await http.post(`/balance/${gameId}/vote`, { option });
}

// 통계
export async function getStats(gameId: number): Promise<StatsRes> {
  return j(http.get<StatsRes>(`/balance/${gameId}/stats`));
}

// 지난게임 (날짜 + 페이지)
export async function getPast(date: string, page = 1, size = 1): Promise<PastListRes> {
  return j(http.get<PastListRes>(`/balance/past?date=${date}&page=${page}&size=${size}`));
}

// 지난 날짜 목록
export async function getPastDates(): Promise<string[]> {
  return j(http.get<string[]>("/balance/past/dates"));
}

// 특정 날짜의 지난게임 목록
export async function getPastByDate(date: string): Promise<PastCard[]> {
  return j(http.get<PastCard[]>(`/balance/past/by-date?date=${date}`));
}

// 새 게임 생성
export async function postCreateGame(req: CreateGameReq): Promise<CreateGameRes> {
  return j(http.post<CreateGameRes>("/balance", req));
}

/** -------- Types -------- */
export type OptionKey = "A" | "B";

export type TodayGameRes = {
  gameId: number;
  title: string;
  options: { label: OptionKey; textContent: string; votes: number }[];
  myVote: OptionKey | null;
};

export type TodayListRes = {
  content: TodayGameRes[];
  page: number;
  size: number;
  totalPages: number;
};

export type StatsRes = {
  gameId: number;
  totalVotes: number;
  options: Record<string, { textContent: string; cnt: number; ratio: number }>;
  mbti: { [label: string]: { [code: string]: { cnt: number; ratio: number } } };
};

export type PastCard = { gameId: number; title: string; startAt: string };
export type PastListRes = {
  content: PastCard[];
  page: number;
  size: number;
  totalPages: number;
};

export type CreateGameReq = {
  title: string;
  optionAText: string;
  optionBText: string;
};

export type CreateGameRes = {
  gameId: number;
  title: string;
};
