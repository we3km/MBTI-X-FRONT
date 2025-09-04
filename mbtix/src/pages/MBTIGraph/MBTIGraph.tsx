import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import styles from "./MBTIGraph.module.css"
import { useNavigate } from "react-router-dom";
// import exitBtn from "../../assets/mini-game/main/나가기.png"

interface MBTIData {
    type: string;
    count: number;
}

const COLORS = [
    "#0088FE", "#00C49F", "#FFBB28", "#FF8042",
    "#A28BFF", "#FF6B6B", "#6BCB77", "#FFD93D",
    "#FF6F91", "#6B5B95", "#88B04B", "#F7CAC9",
    "#92A8D1", "#955251", "#B565A7", "#009B77"
];

export default function MBTIGraph() {
    const [data, setData] = useState<MBTIData[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch("http://localhost:8085/api/getUserMBTI")
            .then(res => res.json())
            .then((rawData) => {
                const formatted = rawData.map((item: any) => ({
                    type: item.MBTI_NAME,
                    count: item.USER_COUNT
                }));
                setData(formatted);
            });
    }, []);

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>사이트 회원의 MBTI 비율</h2>
            <button className={styles.exit} onClick={() => navigate(-1)}>
                {/* <img src={exitBtn} alt="뒤로가기" /> */}
            </button>
            <div className={styles.graphWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="count"
                            nameKey="type"
                            cx="50%"
                            cy="50%"
                            outerRadius={180}  /* radius도 크게 */
                            fill="#8884d8"
                            label
                        >
                            {data.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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