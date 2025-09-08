import axios from "axios";

export type TodayGameRes = {
  gameId: number;
  title: string;
  options: { label: "A" | "B"; title: string; votes: number }[];
  myVote: "A" | "B" | null;
};

const http = axios.create({
  baseURL: "http://localhost:8085/api", // Spring Boot API 서버
//  withCredentials: true,
});

export async function getToday(): Promise<TodayGameRes | null> {
  const r = await http.get("/balance/today");
  return r.status === 204 ? null : r.data;
}

export async function postVote(gameId: number, option: "A" | "B") {
  await http.post(`/balance/${gameId}/vote`, { option });
}

export type StatsRes = {
  gameId: number;
  totalVotes: number;
  options: { [label: string]: { cnt: number; ratio: number } };
};

export async function getStats(gameId: number): Promise<StatsRes> {
  const r = await http.get(`/balance/${gameId}/stats`);
  return r.data;
}