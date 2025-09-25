import styles from './OnlineGame.module.css';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { store } from '../../../store/store';
import Modal from "./modal/CreateGameRoom";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../../api/mainPageApi';
import toast from 'react-hot-toast';

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
    maxCount: number;
};

export default function OnlineGame() {
    const navigate = useNavigate();
    const getUserId = () => store.getState().auth.user?.userId;
    const userId = getUserId();
    const queryClient = useQueryClient();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [prevRooms, setPrevRooms] = useState<gameRoom[]>([]); // 이전 방 리스트 저장
    const [newRoomId, setNewRoomId] = useState<number | null>(null); // 새로 생긴 방 id 저장

    const { data: gameRooms, isLoading, isError } = useQuery<gameRoom[]>({
        queryKey: ["gamingRoomList"],
        queryFn: async () => {
            const res = await api.get("/selectGameRoomList");
            return res.data;
        },
        refetchInterval: 1000, // 1초마다 최신화된 게임방 리스트 불러옴
        staleTime: 1000 * 60 * 5,
        retry: 1,
    });
    console.log("게임방 리스트 각 속성", gameRooms);

    // 새로 생긴 방 찾기
    useEffect(() => {
        if (gameRooms && prevRooms.length > 0) {
            const newOnes = gameRooms.filter(
                (room) => !prevRooms.some((prev) => prev.roomId === room.roomId)
            );
            if (newOnes.length > 0) {
                setNewRoomId(newOnes[0].roomId);
            }
        }
        setPrevRooms(gameRooms || []);
    }, [gameRooms]);

    const enterGameRoom = async (roomId: number) => {
        try {
            const response = await api.post("/joinGameRoom", { roomId, userId });
            if (response.data.status === 'success') {
                queryClient.invalidateQueries({ queryKey: ['gamersList', roomId] });
                navigate(`/miniGame/CatchMind/${roomId}`);
            } else {
                toast.error("이미 게임이 시작된 방입니다.", {
                    duration: 1500,
                    position: "top-center",
                });
            }
        } catch (err) {
            toast.error("이미 삭제된 방입니다.");
            console.error("API 요청 실패:", err);
        }
    };

    if (isLoading) return <div>로딩 중...</div>;
    if (isError) return <div>데이터 로드 실패</div>;

    return (
        <div className={styles.lobbyContainer}>
            <h1 className={styles.title}>
                GAME LOBBY
            </h1>
            <img
                src="/icons/exit.png"
                alt="게임 종료"
                className={styles.closeButton}
                onClick={(e) => {
                    e.stopPropagation();
                    navigate("/miniGame");
                }}
            />
            <div className={styles.lobbyBox}>
                <header className={styles.header}>
                    <button
                        className={styles.createRoom}
                        onClick={() => setIsModalOpen(true)}
                    >
                        방 만들기
                    </button>
                </header>

                <div className={styles.roomList}>
                    {gameRooms != null &&
                        gameRooms.map((room) => {
                            const statusStyle = styles.playing;
                            return (
                                <div
                                    key={room.roomId}
                                    className={`${styles.roomItemContainer} ${newRoomId === room.roomId ? styles.newRoom : ""
                                        }`}
                                    onClick={() => {
                                        if (room.playerCount + 1 > room.maxCount) {
                                            toast.error("방이 꽉찼습니다!", { duration: 2000 });
                                            return;
                                        }
                                        enterGameRoom(room.roomId);
                                    }}
                                >
                                    <div className={styles.userInfo}>
                                        <img
                                            src={`/profile/default/${room.profile}`}
                                            alt={`${room.nickname} profile`}
                                            className={styles.profile}
                                            onClick={
                                                (e) => {
                                                    e.stopPropagation();
                                                    navigate("/user/"+ room.creatorId);
                                                }
                                            }
                                        />
                                        <div className={styles.nameMbti}>
                                            <span className={styles.name}>{room.nickname}</span>
                                            <span className={styles.mbti}>{room.mbtiName}</span>
                                        </div>
                                    </div>
                                    <div className={styles.roomTitle}>
                                        <span>{room.roomName}</span>
                                    </div>
                                    <div className={styles.roomStatus}>
                                        <span
                                            className={
                                                room.status?.trim().toUpperCase() === "Y"
                                                    ? styles.statusPlaying
                                                    : styles.statusWaiting
                                            }
                                        >
                                            {room.status?.trim().toUpperCase() === "Y" ? "게임중..." : "대기중..."}
                                        </span>
                                    </div>
                                    <div className={styles.roomPlayerCount}>
                                        <span className={statusStyle}>
                                            {room.playerCount} / {room.maxCount}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>

            {isModalOpen && <Modal onClose={() => setIsModalOpen(false)} />}
        </div>
    );
}