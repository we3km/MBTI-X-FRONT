import mini from "./main.module.css"
import speedIcon from "../../assets/mini-game/main/Speed.png"
import quizIcon from "../../assets/mini-game/main/Quiz.png"
import picIcon from "../../assets/mini-game/main/Wrong.png"
import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { Outlet } from 'react-router-dom';

export default function GameMenu() {

    interface RankItem {
        GAME_CODE: number;
        TOTAL_SCORE: number;
        MBTI_NAME: string;
    }

    type RankMap = {
        [key: number]: RankItem[]; // key는 게임 코드
    };

    const [ranks, setRanks] = useState<RankMap>({});

    // 화면 띄워질때 랭크 가져오자
    useEffect(() => {
        fetch("http://localhost:8085/api/rank", {
        })
            .then(res => res.json())
            .then((data) => {
                console.log("랭크 받아오는 데이터", data);
                setRanks(data);
            })
            .catch(err => console.error(err));
    }, []);

    return (
        <>
            <div className={mini.container}>

                <div className={mini.topbutton}>
                    <Link to="/miniGame/GameRank">
                        <button>게임 랭크 보기</button>
                    </Link>
                </div>

                <div className={mini.cardcontainer}>
                    <div className={mini.card}>
                        <div className={mini.cardtitle}>스피드 퀴즈</div>
                        <img src={quizIcon} alt="퀴즈 아이콘" className={mini.cardicon} />
                        <Link to="/miniGame/SpeedQuiz">
                            <button className={mini.startbutton}>게임 시작</button>
                        </Link>
                        <div className={mini.ranking}>
                            <div>🥇 {ranks[1] && ranks[1][0]?.MBTI_NAME}  {ranks[1] && ranks[1][0]?.TOTAL_SCORE} POINT</div>
                            <div>🥈 {ranks[1] && ranks[1][1]?.MBTI_NAME}  {ranks[1] && ranks[1][1]?.TOTAL_SCORE} POINT</div>
                            <div>🥈 {ranks[1] && ranks[1][2]?.MBTI_NAME}  {ranks[1] && ranks[1][2]?.TOTAL_SCORE} POINT</div>
                        </div>
                    </div>

                    <div className={mini.card}>
                        <div className={mini.cardtitle}>순발력 게임</div>
                        <img src={speedIcon} alt="순발력 아이콘" className={mini.cardicon} />
                        <Link to="/miniGame/ReactionTest">
                            <button className={mini.startbutton}>게임 시작</button>
                        </Link >
                        <div className={mini.ranking}>
                            <div>🥇 {ranks[2] && ranks[2][0]?.MBTI_NAME} {ranks[2] && ranks[2][0]?.TOTAL_SCORE} POINT</div >
                            <div>🥈 {ranks[2] && ranks[2][1]?.MBTI_NAME}  {ranks[2] && ranks[2][1]?.TOTAL_SCORE} POINT</div>
                            <div>🥇 {ranks[2] && ranks[2][2]?.MBTI_NAME}  {ranks[2] && ranks[2][2]?.TOTAL_SCORE} POINT</div>
                        </div >
                    </div >

                    <div className={mini.card}>
                        < div className={mini.cardtitle}>캐치 마인드</div>
                        <img src={picIcon} alt="틀린 그림 아이콘" className={mini.cardicon} />
                        < Link to="/miniGame/OnlineGame" >
                            < button className={mini.startbutton}>게임 시작</button>
                        </Link >
                        <div className={mini.ranking}>
                            <div>🥇 {ranks[3] && ranks[3][0]?.MBTI_NAME} {ranks[3] && ranks[3][0]?.TOTAL_SCORE} POINT</div >
                            <div>🥈 {ranks[3] && ranks[3][1]?.MBTI_NAME}  {ranks[3] && ranks[3][1]?.TOTAL_SCORE} POINT</div>
                            <div>🥇 {ranks[3] && ranks[3][2]?.MBTI_NAME}  {ranks[3] && ranks[3][2]?.TOTAL_SCORE} POINT</div>
                        </div >
                    </div >
                </div >
                <Outlet />
            </div >
        </>
    )
}