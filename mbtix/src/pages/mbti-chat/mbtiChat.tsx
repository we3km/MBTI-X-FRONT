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
  features: string; 
  botProfileImageUrl: string; // 👈 이미지 URL 추가
}

export default function MbtiChat() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const { roomId } = useParams<{ roomId: string }>();
  const { state } = useLocation();
  const getUserId = () => store.getState().auth.user?.userId;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const userId = getUserId();
  console.log("회원번호",userId, state)
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
  },[userId])

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  // 새로운 채팅방이 성공적으로 생성되었을 때 호출될 함수
  const handleChatCreated = (newRoom: ChatRoom) => {
    // 기존 rooms 배열에 새로운 채팅방을 추가합니다.
    setRooms((prevRooms) => [...prevRooms, newRoom]);
    // 모달 닫기
    handleCloseModal();
    // 성공적으로 생성되었으므로 목록을 다시 불러올 필요는 없습니다.
  };

  return (
    <div className={styles.container}>
        <div className={styles.sidebar}>
            <button onClick={handleOpenModal} className={styles.createBtn}>
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
                        features: r.features,
                        botProfileImageUrl: r.botProfileImageUrl // 👈 이미지 URL 추가
                      }}
                      className={styles.roomLink}
                    >
                      <div className={styles.roomLinkContent}>
                        <img src={`http://localhost:8085/api${r.botProfileImageUrl}`} alt="Profile" className={styles.profileImage}/> {/* 👈 이미지 표시 */}
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
              <Chat roomId={roomId} state={state} />
            ) : (
              <div className={styles.placeholder}>좌측에서 챗봇을 선택하거나 <br /> 챗봇 만들기를 눌러주세요.</div>
            )}
        </div>
        {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button onClick={handleCloseModal} className={styles.closeBtn}>
              &times;
            </button>
            <CreateChat onChatCreated={handleChatCreated} />
          </div>
        </div>
      )}
    </div>
  );
}