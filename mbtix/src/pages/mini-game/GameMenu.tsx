import mini from "./main.module.css";
import speedIcon from "../../assets/mini-game/main/Speed.png";
import quizIcon from "../../assets/mini-game/main/Quiz.png";
import picIcon from "../../assets/mini-game/main/Wrong.png";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/mainPageApi";
import type { RootState } from "../../store/store";
import { useSelector } from "react-redux";

// 1. 게임 정보를 배열로 분리
const gameList = [
    {
        title: "SPEED QUIZ",
        icon: quizIcon,
        link: "/miniGame/SpeedQuiz",
        rankKey: 1, // ranks 객체에서 데이터를 찾기 위한 키
    },
    {
        title: "REACTION",
        icon: speedIcon,
        link: "/miniGame/ReactionTest",
        rankKey: 2,
    },
    {
        title: "CATCH MIND",
        icon: picIcon,
        link: "/miniGame/OnlineGame",
        rankKey: 3,
    },
];

interface RankItem {
    MBTI_NAME: string;
    TOTAL_SCORE: number;
}

interface Game {
    title: string;
    icon: string;
    link: string;
    rankKey: number;
}

type RanksMap = {
    [key: number]: RankItem[];
}

interface GameCardProps {
    game: Game;
    ranks: RanksMap;
}

const GameCard: React.FC<GameCardProps> = ({ game, ranks }) => {
    const rankData = ranks[game.rankKey] || [];
    const medals = ['🥇', '🥈', '🥉'];
    return (
        <div className={mini.card}>
            <div className={mini.cardtitle}>{game.title}</div>
            <img src={game.icon} alt={`${game.title} 아이콘`} className={mini.cardicon} />
            <Link to={game.link}>
                <button className={mini.startbutton}>START</button>
            </Link>
            <div className={mini.ranking}>
                {rankData.slice(0, 3).map((rank, index) => (
                    <div key={index}>
                        {medals[index]} {rank.MBTI_NAME} &nbsp; {rank.TOTAL_SCORE} POINT
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function GameMenu() {
    const user = useSelector((state: RootState) => state.auth.user);
    // const navigate = useNavigate();
    console.log("로그인한 회원 권한 :", user?.roles);

    interface RankItem {
        GAME_CODE: number;
        TOTAL_SCORE: number;
        MBTI_NAME: string;
    }

    type RankMap = {
        [key: number]: RankItem[];
    };

    const { data: ranks, isLoading, isError } = useQuery<RankMap>({
        queryKey: ["ranks"],
        queryFn: async () => {
            const res = await api.get("/rank");
            return res.data;
        },
        staleTime: 1000 * 60,
        retry: 1,
    });

    if (isLoading) return <div>로딩 중...</div>;
    if (isError) return <div>데이터 로드 실패</div>;

    return (
        <div className={mini.container}>
            {/* <img src="/icons/exit.png" alt="나가기" className={mini.closeButon}
                onClick={() => navigate("/")} /> */}
            <img src="/icons/mini-game.png" alt="미니게임" className={mini.title} />
            <div className={mini.topbutton}>
                <Link to="/miniGame/GameRank">
                    <button>RANKING</button>
                </Link>
                {/* 관리자 권한으로 게임데이터 넣기 */}
                {user?.roles?.includes("ROLE_ADMIN") &&
                    <Link to="/miniGame/AdminQuizSubmit">
                        <button>게임 데이터 넣기</button>
                    </Link>}
            </div>
            <div className={mini.cardcontainer}>
                {gameList.map((game) => (
                    <GameCard key={game.rankKey} game={game} ranks={ranks || {}} />
                ))}
            </div>
        </div>
    );
}