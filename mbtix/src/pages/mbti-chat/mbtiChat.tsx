import { useEffect, useState } from "react";
import Chat from "./chat";
import { Link, useLocation, useParams } from "react-router-dom";
import { store } from "../../store/store";
import { chatbotApi } from "../../api/chatbot/catbotApi";
import styles from "./MbtiChat.module.css";
import CreateChat from "./createChat";

interface ChatRoom{
  roomId:number;
  userId:number;
  botMbti:string;
  botName:string;
  createdAt:string;
  gender:string;
  talkStyle:string;
  age:number;
  personality: string;
  appearance: string;
  botProfileImageUrl: string;
}

export default function MbtiChat() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const { roomId } = useParams<{ roomId: string }>();
  const { state } = useLocation();
  const getUserId = () => store.getState().auth.user?.userId;
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const userId = getUserId();
  const [currentBot, setCurrentBot] = useState<ChatRoom | null>(null);

  // 채팅방 목록 불러오기
  const fetchRooms = () => {
    if (!userId) return; // 로그인 안 되어있으면 호출하지 않음
    chatbotApi
      .get(`/rooms/${userId}`)
      .then((res) => {
        setRooms(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(()=>{
    fetchRooms();
  },[userId]);

  useEffect(() => {
    if (roomId && state) {
      setCurrentBot({
        roomId: parseInt(roomId),
        userId: userId!,
        botMbti: state.mbti,
        botName: state.botName,
        createdAt: "",
        gender: state.gender,
        talkStyle: state.talkStyle,
        age: state.age,
        personality: state.personality,
        appearance: state.appearance,
        botProfileImageUrl: state.botProfileImageUrl,
      });
    }
  }, [roomId, state, userId]);

  const handleOpenCreateModal = () => setIsCreateModalOpen(true);
  const handleCloseCreateModal = () => setIsCreateModalOpen(false);

  const handleOpenDetailModal = () => setIsDetailModalOpen(true);
  const handleCloseDetailModal = () => setIsDetailModalOpen(false);

  const handleOpenImageModal = () => setIsImageModalOpen(true);
  const handleCloseImageModal = () => setIsImageModalOpen(false);

  // 새로운 채팅방이 성공적으로 생성되었을 때 호출될 함수
  const handleChatCreated = (newRoom: ChatRoom) => {
    setRooms((prevRooms) => [...prevRooms, newRoom]);
    handleCloseCreateModal();
    // 새로운 방이 생성되면 currentBot 상태를 즉시 업데이트
    setCurrentBot(newRoom);
  };

  return (
    <div className={styles.container}>
        <div className={styles.sidebar}>
          {currentBot && (
            <div className={styles.currentBotInfo}>
                <div className={styles.currentBotDetail}>
                    <img
                        src={`http://localhost:8085/api${currentBot.botProfileImageUrl}`}
                        alt="Profile"
                        className={styles.currentBotImage}
                        onClick={handleOpenImageModal}
                    />
                    <div>
                        <div className={styles.currentBotName}>{currentBot.botName}</div>
                        <span className={styles.currentBotMbti}>({currentBot.botMbti})</span>
                    </div>
                </div>
                <button onClick={handleOpenDetailModal} className={styles.detailBtn}>
                    상세정보 보기
                </button>
            </div>
          )}
            <button onClick={handleOpenCreateModal} className={styles.createBtn}>
                + 챗봇 만들기
            </button>
            <ul className={styles.roomList}>
                {rooms.map(r => (
                  <li key={r.roomId} className={styles.roomItem}>
                    <Link 
                      to={`/chat/${r.roomId}`}
                      state={{
                        mbti:r.botMbti,
                        botName:r.botName,
                        gender:r.gender, 
                        talkStyle:r.talkStyle, 
                        age:r.age, 
                        personality: r.personality,
                        appearance: r.appearance,
                        botProfileImageUrl: r.botProfileImageUrl
                      }}
                      className={styles.roomLink}
                    >
                      <div className={styles.roomLinkContent}>
                        <img src={`http://localhost:8085/api${r.botProfileImageUrl}`} alt="Profile" className={styles.profileImage}/>
                        <div>
                          {r.botName} <span className={styles.mbti}>({r.botMbti})</span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
            </ul>
        </div>
        <div className={styles.main}>
            {roomId ? (
              <Chat roomId={roomId} state={currentBot} />
            ) : (
              <div className={styles.placeholder}>좌측에서 챗봇을 선택하거나 <br /> 챗봇 만들기를 눌러주세요.</div>
            )}
        </div>
        {isCreateModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button onClick={handleCloseCreateModal} className={styles.closeBtn}>
              &times;
            </button>
            <CreateChat onChatCreated={handleChatCreated} />
          </div>
        </div>
      )}
      {isDetailModalOpen && currentBot && (
        <div className={styles.modalOverlay}>
          <div className={styles.detailModalContent}>
            <button onClick={handleCloseDetailModal} className={styles.detailCloseBtn}>
              &times;
            </button>
            <div className={styles.detailBotInfo}>
                <h3>{currentBot.botName} 상세정보</h3>
                <p><strong>성별:</strong> {currentBot.gender}</p>
                <p><strong>나이:</strong> {currentBot.age}</p>
                <p><strong>말투:</strong> {currentBot.talkStyle}</p>
                <p><strong>성격:</strong> {currentBot.personality}</p>
                <p><strong>외형:</strong> {currentBot.appearance}</p>
            </div>
          </div>
        </div>
      )}
      {isImageModalOpen && currentBot && (
        <div className={styles.fullImageModal} onClick={handleCloseImageModal}>
            <div className={styles.fullImageContent} onClick={e => e.stopPropagation()}>
                <img
                    src={`http://localhost:8085/api${currentBot.botProfileImageUrl}`}
                    alt="Full-size Profile"
                />
            </div>
        </div>
      )}
    </div>
  );
}