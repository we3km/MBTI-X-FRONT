import Chat from "./chat";
import ChatBotInfo from "./chatBotInfo";
import ChatList from "./chatList";
import CreateChat from "./createChat";
import './MbtiChat.css'

export default function MbtiChat() {


  return (
    <>
        <div className="mbti-chat-container">
            <div className="mbti-chat-side-bar">
                dasdasddsa
                <ChatBotInfo/>
                <CreateChat/>
                <ChatList/>
            </div>
            <div className="chat-main">
                <Chat/>
            </div>
        </div>
    </>
  );
}