import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { store } from "../../store/store";
import { chatbotApi } from "../../api/chatbot/catbotApi";
import styles from "./createChat.module.css"; 
const mbtiList = [
  "ESTJ","ESTP","ESFJ","ESFP"
  ,"ENTJ","ENTP","ENFJ","ENFP"
  ,"ISTJ","ISTP","ISFJ","ISFP"
  ,"INTJ","INTP","INFJ","INFP" // 필요한 MBTI 모두
];

interface createChat{
    userId:number;
    botMbti:string;
    botName:string;
}

// 새로운 prop 추가
interface CreateChatComponentProps {
  onChatCreated?: () => void;
}

export default function CreateChat({ onChatCreated }: CreateChatComponentProps){
    const [selectedMBTI, setSelectedMBTI] = useState<string | null>(null);
    const [botName, setBotName] = useState<string>('');
    const navigate = useNavigate();
    const getUserId = () => store.getState().auth.userId;
    const getNickname = () => store.getState().auth.user?.nickname

    const nickName = getNickname();
    const handleCreate = () => {
    if (!selectedMBTI) return alert("MBTI를 선택해주세요!");
    const userId = getUserId();
    if (userId == null) {
        alert("로그인이 필요합니다!", );
        return;
    } 
    const room:createChat = { userId:userId, botMbti:selectedMBTI, botName:botName} 
    // 👉 여기서 Spring Boot API 호출해서 채팅방 생성 가능
    // fetch("http://localhost:8080/chat/rooms", { ... })
    

    chatbotApi
      .post("",room)
      .then(res =>{
        const roomId = res.data
        // 생성 완료 후 채팅방으로 이동
        navigate(`/chat/${roomId}`, {state:{mbti:selectedMBTI, botName:botName, nickName:nickName}});
        if(onChatCreated) onChatCreated();
      }).catch((err)=>{
        console.log(err)
      })
  };

return (
      <>
        <div className={styles.container}>
            <h2 className={styles.heading}>챗봇 성격(MBTI)을 선택해주세요 🤖</h2>
            <div className={styles.mbtiList}>
                {mbtiList.map(mbti => (
                    <button
                        key={mbti}
                        onClick={() => setSelectedMBTI(mbti)}
                        className={`${styles.mbtiButton} ${selectedMBTI === mbti ? styles.selected : ''}`}
                    >
                        {mbti}
                    </button>
                ))}
            </div>
            <div className={styles.inputContainer}>
                <h3 className={styles.heading}>챗봇 이름을 입력해주세요 ✍️</h3>
                <input
                    type="text"
                    value={botName}
                    onChange={(e) => setBotName(e.target.value)}
                    placeholder="예: 다정한 챗봇"
                    className={styles.inputField}
                />
            </div>
            <div>
                <button onClick={handleCreate} className={styles.createButton}>
                    선택 완료 ✅
                </button>
            </div>
        </div>
      </>          
    );
}