import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
    const navigate = useNavigate();

    const handleCreate = () => {
    if (!selectedMBTI) return alert("MBTI를 선택해주세요!");


    const room:createChat = { userId:1, botMbti:selectedMBTI, botName:"이름"} 
    // 👉 여기서 Spring Boot API 호출해서 채팅방 생성 가능
    // fetch("http://localhost:8080/chat/rooms", { ... })
    axios.post("http://localhost:8085/api/chatbot", room)
    .then(()=>{

    })
    .catch((err)=>{
        console.log(err)
    })

    // 생성 완료 후 채팅방으로 이동
    navigate(`/chat/${selectedMBTI}`);
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
                <button onClick={handleCreate} style={{ padding: "10px 20px" }}>
                선택 완료
                </button>
            </div>
        </>
    )
}