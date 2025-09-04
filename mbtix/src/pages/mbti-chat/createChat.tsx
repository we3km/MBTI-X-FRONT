import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { store } from "../../store/store";
import { chatbotApi } from "../../api/chatbot/catbotApi";

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

export default function CreateChat(){
    const [selectedMBTI, setSelectedMBTI] = useState<string | null>(null);
    const [botName, setBotName] = useState<string>('');
    const navigate = useNavigate();
    const getUserId = () => store.getState().auth.userId;

    const handleCreate = () => {
    if (!selectedMBTI) return alert("MBTI를 선택해주세요!");
    const userId = getUserId();
    if (userId == null) {
        alert("로그인이 필요합니다!");
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
        navigate(`/chat/${roomId}`, {state:{mbti:selectedMBTI, botName:botName}});
      }).catch((err)=>{
        console.log(err)
    })


    // axios.post("http://localhost:8085/api/chatbot", room)
    // .then((res)=>{
    //     const roomId = res.data
    //     // 생성 완료 후 채팅방으로 이동
    //     navigate(`/chat/${roomId}`, {state:{mbti:selectedMBTI, botName:botName}});
    // })
    // .catch((err)=>{
    //     console.log(err)
    // })
  };

    return (
        <>
            <div>
                <h2>챗봇 성격(MBTI)을 선택해주세요</h2>
                {mbtiList.map(mbti => (
                <button
                    key={mbti}
                    onClick={() => setSelectedMBTI(mbti)}
                    style={{ margin: 5 }}
                >
                    {mbti}
                </button>
                ))}
            </div>
            <div style={{ marginTop: 20 }}>
                <h3>챗봇 이름을 입력해주세요</h3>
                <input
                type="text"
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                placeholder="예: 다정한 챗봇"
                style={{ padding: "5px 10px", width: "200px" }}
                />
            </div>
            <div style={{ marginTop: 20 }}>
                <button onClick={handleCreate} style={{ padding: "10px 20px" }}>
                선택 완료
                </button>
            </div>
        </>
    )
}