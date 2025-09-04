import axios from "axios";
import { useState, useEffect, useRef } from "react";

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
console.log("??"+ roomId, state)
  useEffect(() => {
    // DB에서 지난 메시지 불러오기
    axios.get(`http://localhost:8085/api/chatbot/${roomId}/messages`)
      .then(res => setMessages(res.data))
      .catch(err => console.error(err));
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
  await axios.post(`http://localhost:8085/api/chatbot/${roomId}/message`, userMessage);

  try {
    // 4. FastAPI 서버에 요청 (스트리밍 응답)
    const response = await fetch(`http://localhost:8000/chat/${roomId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userInput, mbti:state.mbti }),
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
    await axios.post(`http://localhost:8085/api/chatbot/${roomId}/message`, botMessage);

  } catch (err) {
    console.error(err);
  }
};



  return (
    <div style={{ border: "1px solid #ccc", padding: 10, maxWidth: 500 }}>
      <div style={{ height: 400, overflowY:   "auto", marginBottom: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ textAlign: m.sender === "user" ? "right" : "left", margin: "5px 0" }}>
            <b>{m.sender === "user" ? "You" : state.botName}:</b> {m.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage}>
        <input value={input} onChange={e => setInput(e.target.value)} style={{ width: "80%" }} />
        <button type="submit" style={{ width: "18%" }}>Send</button>
      </form>
    </div>
  );
}
