import axios from "axios";

export type TodayGameRes = {
  gameId: number;
  title: string;
  options: { label: "A"|"B"; title: string; votes: number }[];
  myVote: "A"|"B"|null;
};

export async function getToday(): Promise<TodayGameRes|null> {
  const r = await axios.get("/balance/today");
  return r.status === 204 ? null : r.data;
}

export async function postVote(gameId: number, option: "A"|"B") {
  await axios.post(`/balance/${gameId}/vote`, { option });
}
