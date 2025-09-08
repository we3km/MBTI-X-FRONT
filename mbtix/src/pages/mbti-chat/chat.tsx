import { useState, useEffect, useRef } from "react";
import { chatbotApi } from "../../api/chatbot/catbotApi";
import styles from "./Chat.module.css";
import { store } from "../../store/store";
interface ChatMessage {
  // messageId: number;
  roomId: number;
  sender: "user" | "bot";
  content: string;
  // createdAt: string;
}

interface SaveChatMessage {
  roomId: number;
  sender: "user" | "bot";
  content: string;
}


interface ChatProps {
  roomId: string;
  state:{
    mbti:string;
    botName:string;
  }
}

export default function Chat( { roomId, state }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const getAccessToken = () => store.getState().auth.accessToken;
  const token = getAccessToken();
  const getNickname = () => store.getState().auth.user?.nickname
  const nickName = getNickname();
console.log("??"+ roomId, state, nickName)
  useEffect(() => {
    // DB에서 지난 메시지 불러오기
    chatbotApi
      .get(`/${roomId}/messages`)
      .then(res => setMessages(res.data))
      .catch(err => console.log(err))
  }, [roomId]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages]);

const sendMessage = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!input.trim()) return;

  const userInput = input;
  setInput("");

  // 1. 사용자 메시지 객체
  const userMessage: SaveChatMessage = { 
    roomId: Number(roomId), 
    sender: "user", 
    content: userInput 
  };

  // 2. UI에 먼저 반영
  setMessages(prev => [...prev, userMessage]);

  // 3. 사용자 메시지 DB 저장
  await chatbotApi
    .post(`/${roomId}/message`, userMessage)
    .then()
    .catch(err => console.log(err))

  try {
    // 4. FastAPI 서버에 요청 (스트리밍 응답)
    const response = await fetch(`http://localhost:8000/chat/${roomId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userInput, mbti:state.mbti, botName:state.botName, token:token, nickname:nickName }),
    });

    const reader = response.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder("utf-8");
    let botText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      botText += chunk;

      // 5. 스트리밍된 토큰 UI에 실시간 반영
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.sender === "bot") {
          return [...prev.slice(0, -1), { ...last, content: botText }];
        } else {
          return [...prev, { roomId: Number(roomId), sender: "bot", content: botText }];
        }
      });
    }

    // 6. 최종 완성된 봇 응답 DB 저장
    const botMessage: SaveChatMessage = {
      roomId: Number(roomId),
      sender: "bot",
      content: botText,
    };
    await chatbotApi
      .post(`/${roomId}/message`, botMessage)
      .then()
      .catch(err => console.log(err))
  } catch (err) {
    console.error(err);
  }
};



  return (
    <div className={styles.chatContainer}>
      <div className={styles.messages}>
        {messages.map((m, i) => (
          <div key={`${m.roomId}-${i}`} className={m.sender === "user" ? styles.userWrapper : styles.botWrapper}>
            {/* 챗봇 메시지일 때만 이름 표시 */}
            {m.sender === "bot" && (
              <div className={styles.botName}>{state.botName}</div>
            )}

            {/* 메시지 말풍선 */}
            <div className={`${styles.message} ${m.sender === "user" ? styles.user : styles.bot}`}>
              <p className={styles.content}>{m.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className={styles.inputArea}>
        <input 
          value={input}
          onChange={e => setInput(e.target.value)} 
          className={styles.input}
          placeholder="메시지를 입력하세요..."
        />
        <button type="submit" className={styles.sendBtn}>보내기</button>
      </form>
    </div>
  );
}
