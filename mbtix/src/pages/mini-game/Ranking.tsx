import ranking from "./Ranking.module.css";
import { useNavigate } from "react-router-dom";
import api from "../../../src/api/mainPageApi"

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LabelList,
} from "recharts";
import { useQuery } from "@tanstack/react-query";

interface RankData {
    mbti: string;
    score: number;
}

interface GameRank {
    title: string;
    data: RankData[];
}

export default function GameRank() {
    interface RankItem {
        GAME_CODE: number;
        TOTAL_SCORE: number;
        MBTI_NAME: string;
    }

    const navigate = useNavigate();

    const { data: ranks, isLoading, isError } = useQuery({
        queryKey: ["ranks"],
        queryFn: async () => {
            const res = await api.get<Record<number, RankItem[]>>("/rank");
            return res.data;
        },
        select: (data) => {
            const gameNames: Record<number, string> = {
                1: "Speed-Quiz",
                2: "Reaction-Test",
                3: "Catch-Mind",
            };

            const gameRanks: GameRank[] = Object.entries(data).map(([code, rankItems]) => ({
                title: gameNames[Number(code)] || `Game ${code}`,
                data: rankItems
                    .map(item => ({
                        mbti: item.MBTI_NAME,
                        score: item.TOTAL_SCORE,
                    }))
                    .sort((a, b) => b.score - a.score),
            }));

            // 👇 이 부분이 빠져서 발생한 오류입니다!
            return gameRanks;
        },
        staleTime: 1000 * 60,
        retry: 1,
    });

    if (isLoading) return <div>로딩 중...</div>;
    if (isError) return <div>데이터 로드 실패</div>;

    return (
        <div className={ranking.rankContainer}>
            <div className={ranking.pageTitle}><img src="/icons/Game_Rank.png" /></div>
            <div className={ranking.rankWrapper}>
                <button className={ranking.closeButton} onClick={() => { navigate(-1) }}>
                    <img src="/icons/exit.png" alt="Close" />
                </button>
                {ranks != undefined && ranks.map((game, idx) => (
                    <div key={idx} className={ranking.rankCard}>
                        <h2 className={ranking.rankTitle}>{game.title}</h2>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart
                                layout="vertical"
                                data={game.data}
                                margin={{ top: 10, right: 20, left: 40, bottom: 10 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                                <XAxis type="number" hide />
                                <YAxis
                                    type="category"
                                    dataKey="mbti"
                                    width={50}
                                    tick={{ fill: "#ffffff", fontSize: 14, fontWeight: "bold" }}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#333", border: "none" }}
                                    itemStyle={{ color: "#fff" }}
                                    labelStyle={{ color: "#fff" }}
                                />
                                <Bar dataKey="score" fill="#d8d8d8ff" radius={[0, 8, 8, 0]}>
                                    <LabelList dataKey="score" position="right" fill="#ffffff" />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ))}
            </div>
        </div>
    );
}