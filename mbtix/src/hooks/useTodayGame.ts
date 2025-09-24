// src/hooks/useTodayGame.ts
import { useEffect, useState } from "react";
import { getToday } from "../api/BalGameApi";

export function useTodayGame() {
  const [today, setToday] = useState<any>(null);

  useEffect(() => {
    getToday(1, 1)
      .then((res) => {
        setToday(res.content[0] ?? null);
      })
      .catch(console.error);
  }, []);

  return today;
}
