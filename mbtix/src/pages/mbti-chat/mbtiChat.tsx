import { useEffect, useState } from "react";
import Chat from "./chat";
import ChatBotInfo from "./chatBotInfo";
import ChatList from "./chatList";
import './MbtiChat.css'
import { Link, useLocation, useParams } from "react-router-dom";
import { store } from "../../store/store";
import { chatbotApi } from "../../api/chatbot/catbotApi";

interface ChatRoom{
  roomId:number;
  userId:number;
  botMbti:string;
  botName:string;
  createdAt:string;
}

export default function MbtiChat() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const { roomId } = useParams<{ roomId: string }>();
  const { state } = useLocation();
 const getUserId = () => store.getState().auth.userId;

  const userId = getUserId();
  // // 채팅방 목록 불러오기
  useEffect(()=>{
    chatbotApi
      .get(`/rooms/${userId}`)
      .then((res)=>{
        setRooms(res.data)
        console.log("state"+state)
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
                      <Link to={`/chat/${r.roomId}`}
                      state={{mbti:r.botMbti, botName:r.botName }} >
                        {r.botName} ({r.botMbti})
                      </Link>
                    </li>
                  ))}
                </ul>
                <ChatList/>
            </div>
            <div className="chat-main">
                {roomId ? (
                  <Chat roomId={roomId} state={state} />
                ) : (
                  <div>좌측에서 챗봇을 선택하거나 만들기를 눌러주세요.</div>
                )}
            </div>
        </div>
    </>
  );
}