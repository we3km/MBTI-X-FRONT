import ranking from "./Ranking.module.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

    const [ranks, setRanks] = useState<GameRank[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch("http://localhost:8085/api/rank")
            .then(res => res.json())
            .then((data: Record<number, RankItem[]>) => { // data는 객체
                console.log("랭크 받아오는 데이터", data);

                const gameNames: Record<number, string> = {
                    1: "퀴즈게임",
                    2: "순발력 테스트",
                    3: "온라인 게임",
                };

                // Object.entries를 이용해서 배열로 변환
                const gameRanks: GameRank[] = Object.entries(data).map(([code, ranks]) => ({
                    title: gameNames[Number(code)] || `Game ${code}`,
                    data: ranks
                        .map(item => ({
                            mbti: item.MBTI_NAME,
                            score: item.TOTAL_SCORE,
                        }))
                        .sort((a, b) => b.score - a.score),
                }));

                setRanks(gameRanks);
            })
            .catch(err => console.error(err));
    }, []);

    return (
        <div className={ranking.rankContainer}>
            <button className={ranking.rankExit} onClick={() => { navigate(-1) }}>메인페이지로</button>
            <div className={ranking.pageTitle}>GAME RANK</div>
            <div className={ranking.rankWrapper}>

                {ranks.map((game, idx) => (
                    <div key={idx} className={ranking.rankCard}>
                        <h2 className={ranking.rankTitle}>{game.title}</h2>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart
                                layout="vertical"
                                data={game.data}
                                margin={{ top: 10, right: 20, left: 40, bottom: 10 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="mbti" width={50} />
                                <Tooltip />
                                <Bar dataKey="score" fill="#ff6b6b" radius={[0, 8, 8, 0]}>
                                    <LabelList dataKey="score" position="right" />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ))}
            </div>
        </div>
    );
}