import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { PieProps } from "recharts";
import styles from "./MBTIGraph.module.css";
import { useNavigate } from "react-router-dom";

const COLORS = [
    "#0088FE", "#00C49F", "#FFBB28", "#FF8042",
    "#A28BFF", "#FF6B6B", "#6BCB77", "#FFD93D",
    "#FF6F91", "#6B5B95", "#88B04B", "#F7CAC9",
    "#92A8D1", "#955251", "#B565A7", "#009B77"
];

type PieData = NonNullable<PieProps['data']>[number];

export default function MBTIGraph() {
    const [data, setData] = useState<PieData[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch("http://localhost:8085/api/getUserMBTI")
            .then(res => res.json())
            .then((rawData: any[]) => {
                const formattedData: PieData[] = rawData.map(item => ({
                    name: item.MBTI_NAME,
                    value: item.USER_COUNT
                }));
                setData(formattedData);
            })
            .catch(err => {
                console.error("MBTI 데이터 로드 실패:", err);
            });
    }, []);

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>
                <img src="/icons/MBTIofUsers.png" alt="MBTI of Users" />
            </h2>
            <button className={styles.exit} onClick={() => navigate(-1)}>
                <img src="/icons/exit.png" alt="Close" />
            </button>
            <div className={styles.graphWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={180}
                            fill="#8884d8"
                            label
                        >
                            {data.map((_, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
