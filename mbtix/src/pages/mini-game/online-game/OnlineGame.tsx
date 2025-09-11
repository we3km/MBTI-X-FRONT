import styles from './OnlineGame.module.css';
import exit from "../../../assets/mini-game/reaction/퀴즈 나가기.png"
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { store } from '../../../store/store';
import Modal from "../online-game/modal/CreateGameRoom";
import { useQuery } from '@tanstack/react-query';
import api from '../../../api/mainPageApi';

// 게임룸 객체
type gameRoom = {
    roomId: number;
    roomName: string;
    creatorId: number;
    status: string;
    playerCount: number;
    nickname: string;
    mbtiName: string;
    profile: string;
};

export default function OnlineGame() {
    const navigate = useNavigate();
    const getUserId = () => store.getState().auth.user?.userId;
    const userId = getUserId();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [gameRooms, setGameRooms] = useState<gameRoom[]>();

    const handleCreateRoom = (title: string) => {
        alert(`새로운 방이 생성되었습니다! 제목: ${title}, 생성자: ${userId}`);
    };

    const { data: gameRoomList, isLoading, isError } = useQuery<gameRoom[]>({
        queryKey: ["gamingRoomList"],
        queryFn: async () => {
            const res = await api.get("/selectGameRoomList");
            console.log("각 대기방 속성 :", res.data);
            return res.data;
        },
        staleTime: 1000 * 60 * 5,
        retry: 1,
    });

    useEffect(() => {
        if (gameRoomList) {
            console.log("서버에서 받아온 게임방 리스트:", gameRoomList);
            setGameRooms(gameRoomList);
        }
    }, [gameRoomList]);

    if (isLoading) return <div>로딩 중...</div>;
    if (isError) return <div>데이터 로드 실패</div>;

    // 각 게임방 번호 받아와서 게임방 들어가기
    const enterGameRoom = (roomId: number) => {
        console.log("입장할 방 ID:", roomId);
        // 게임방 입장 로직
        (async () => {
            try {
                await api.post("/joinGameRoom", { roomId, userId }, {
                    headers: { "Content-Type": "application/json" }
                });
                console.log({ userId }, { roomId }, "번호 입장");
            } catch (err) {
                console.error("방 입장 실패:", err);
            }
        })();
        navigate(`/miniGame/CatchMind/${roomId}`);
    };

    return (
        <div className={styles.lobbyContainer}>
            <div className={styles.lobbyBox}>
                <header className={styles.header}>
                    <h1 className={styles.title}>대기방 리스트</h1>
                    <button
                        className={styles.closeButton}
                        onClick={(e) => {
                            e.stopPropagation();
                            const confirmExit = window.confirm("게임을 종료하시겠습니까?\n게임 종료시, 메인화면으로 이동합니다.");
                            if (confirmExit) {
                                navigate("/miniGame"); // 메인 페이지 이동
                            }
                        }}
                    >
                        <img src={exit} alt="게임 종료" />
                    </button>
                    <button
                        className={styles.createRoom}
                        onClick={() => setIsModalOpen(true)} // 게임방 여는 모달
                    >
                        게임방 생성
                    </button>
                </header>

                <div className={styles.roomList}>
                    {gameRooms != null && gameRooms.map((room) => {
                        const statusStyle = styles.playing;
                        return (
                            <div key={room.roomId} className={styles.roomItemContainer} onClick={() => enterGameRoom(room.roomId)}>
                                <div className={styles.userInfo}>
                                    <img src={room.profile} alt={`${room.nickname} profile`} className={styles.profile} />
                                    <div className={styles.nameMbti}>
                                        <span className={styles.name}>{room.nickname}</span>
                                        <span className={styles.mbti}>{room.mbtiName}</span>
                                    </div>
                                </div>
                                <div className={styles.roomTitle}>
                                    <span>{room.roomName}</span>
                                </div>
                                <div className={styles.roomStatus}>
                                    <span className={statusStyle}>
                                        {room.playerCount} / 5
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 채팅방 생성 모달쪽 */}
            {isModalOpen && (
                <Modal
                    onClose={() => setIsModalOpen(false)}
                    onCreate={handleCreateRoom}
                />
            )}
        </div>
    );
}