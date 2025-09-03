import { useEffect, useState } from "react";
import Chat from "./chat";
import ChatBotInfo from "./chatBotInfo";
import ChatList from "./chatList";
import './MbtiChat.css'
import { Link, useParams } from "react-router-dom";
import axios from "axios";

interface ChatRoom{
  roomId:number;
  userId:number;
  botMbti:string;
  botName:string;
  createdAt:string;
}

export default function MbtiChat() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const { mbti } = useParams<{ mbti: string }>();
  const userId = 1;
  // // 채팅방 목록 불러오기
  useEffect(()=>{
    axios.get(`http://localhost:8085/api/chatbot/rooms/${userId}`)
      .then((res)=>{
        setRooms(res.data)
      })
      .catch((err)=>{
          console.log(err)
      })
  },[])
  return (
    <>
        <div className="mbti-chat-container">
            <div className="mbti-chat-side-bar">
                <ChatBotInfo/>
                <Link to={"/createChat"}>챗봇 만들기</Link>
                <ul>
                  {rooms.map(r => (
                    <li key={r.roomId}>
                      {r.botName} ({r.botMbti})
                    </li>
                  ))}
                </ul>
                <ChatList/>
            </div>
            <div className="chat-main">
                {mbti ? (
                  <Chat mbti={mbti} />
                ) : (
                  <div>좌측에서 챗봇을 선택하거나 만들기를 눌러주세요.</div>
                )}
            </div>
        </div>
    </>
  );
}