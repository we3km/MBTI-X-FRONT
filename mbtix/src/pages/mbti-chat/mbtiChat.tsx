import { useState } from "react";
import Chat from "./chat";
import ChatBotInfo from "./chatBotInfo";
import ChatList from "./chatList";
import CreateChat from "./createChat";
import './MbtiChat.css'

const mbtiList = [
  "ESTJ","ESTP","ESFJ","ESFP"
  ,"ENTJ","ENTP","ENFJ","ENFP"
  ,"ISTJ","ISTP","ISFJ","ISFP"
  ,"INTJ","INTP","INFJ","INFP" // 필요한 MBTI 모두
];

export default function MbtiChat() {
  const [selectedMBTI, setSelectedMBTI] = useState<string | null>(null);

  if (!selectedMBTI) {
    // MBTI 선택 화면
    return (
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
    );
  }

  return (
    <>
        <div className="mbti-chat-container">
            <div className="mbti-chat-side-bar">
                <ChatBotInfo/>
                <CreateChat/>
                <ChatList/>
            </div>
            <div className="chat-main">
                <Chat mbti={selectedMBTI} />
                <button onClick={() => setSelectedMBTI(null)} style={{ marginTop: 10 }}>
                  MBTI 변경
                </button>
            </div>
        </div>
    </>
  );
}