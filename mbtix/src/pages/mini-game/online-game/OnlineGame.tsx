import styles from './OnlineGame.module.css';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { store } from '../../../store/store';
import Modal from "./modal/CreateGameRoom";
import { useQuery } from '@tanstack/react-query';
import api from '../../../api/mainPageApi';

// 게임룸 객체
type gameRoom = {
    roomId: number;
    roomName: string;
    creatorId: number;
    playerCount: number;
    status: string;
    nickname: string;
    mbtiName: string;
    profile: string;
};

export default function OnlineGame() {
    const navigate = useNavigate();
    const getUserId = () => store.getState().auth.user?.userId;
    const userId = getUserId();

    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: gameRooms, isLoading, isError } = useQuery<gameRoom[]>({
        queryKey: ["gamingRoomList"],
        queryFn: async () => {
            const res = await api.get("/selectGameRoomList");
            return res.data;
        },
        refetchInterval: 2500, // 2초마다 최신화된 게임방 리스트 불러옴
        staleTime: 1000 * 60 * 5,
        retry: 1,
    });

    const enterGameRoom = async (roomId: number) => {
        try {
            const response = await api.post("/joinGameRoom", { roomId, userId });
            if (response.data.status === 'success') {
                navigate(`/miniGame/CatchMind/${roomId}`);
            } else {
                alert("이미 게임이 시작된 방입니다.");
            }
        } catch (err) {
            alert("삭제된 게임방입니다.");
            console.error("API 요청 실패:", err);
        }
    };

    if (isLoading) return <div>로딩 중...</div>;
    if (isError) return <div>데이터 로드 실패</div>;

    return (
        <div className={styles.lobbyContainer}>
            <img src="/icons/exit.png" alt="게임 종료"
                className={styles.closeButton}
                onClick={(e) => {
                    e.stopPropagation();
                    navigate("/miniGame"); // 메인 페이지 이동
                }}
            >
            </img>
            <div className={styles.lobbyBox}>
                <header className={styles.header}>
                    <h1 className={styles.title}>대기방 리스트</h1>
                    <button
                        className={styles.createRoom}
                        onClick={() => setIsModalOpen(true)} // 게임방 여는 모달
                    >
                        방 만들기
                    </button>
                </header>

                <div className={styles.roomList}>
                    {gameRooms != null && gameRooms.map((room) => {
                        const statusStyle = styles.playing;
                        return (
                            <div key={room.roomId} className={styles.roomItemContainer} onClick={() => {
                                if (room.playerCount >= 5) {
                                    alert("방이 꽉찼습니다!");
                                    return;
                                }
                                enterGameRoom(room.roomId);
                            }}>
                                <div className={styles.userInfo}>
                                    <img src={`/profile/default/${room.profile}`} alt={`${room.nickname} profile`} className={styles.profile} />
                                    <div className={styles.nameMbti}>
                                        <span className={styles.name}>{room.nickname}</span>
                                        <span className={styles.mbti}>{room.mbtiName}</span>
                                    </div>
                                </div>
                                <div className={styles.roomTitle}>
                                    <span>{room.roomName}</span>
                                </div>
                                <div className={styles.roomStatus}>
                                    {room.status?.trim().toUpperCase() === "Y" ? "게임중..." : "대기중..."}
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
                />
            )}
        </div>
    );
}