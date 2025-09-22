import { useState, useEffect, useRef } from "react";
import { chatbotApi } from "../../api/chatbot/catbotApi";
import styles from "./Chat.module.css";
import { store } from "../../store/store";

interface ChatMessage {
  roomId: number;
  sender: "user" | "bot";
  content: string;
}

interface SaveChatMessage {
  roomId: number;
  sender: "user" | "bot";
  content: string;
}

interface ChatProps {
  roomId: string;
  state: any;
}

export default function Chat({ roomId, state }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getAccessToken = () => store.getState().auth.accessToken;
  const token = getAccessToken();
  const getNickname = () => store.getState().auth.user?.nickname;
  const nickName = getNickname();

  useEffect(() => {
    // DB에서 지난 메시지 불러오기
    chatbotApi
      .get(`/${roomId}/messages`)
      .then((res) => setMessages(res.data))
      .catch((err) => console.log(err));
  }, [roomId]);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages, isBotTyping]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userInput = input;
    setInput("");

    // 1. 사용자 메시지 객체
    const userMessage: SaveChatMessage = {
      roomId: Number(roomId),
      sender: "user",
      content: userInput,
    };

    // 2. UI에 먼저 반영
    setMessages((prev) => [...prev, userMessage]);

    // 3. 사용자 메시지 DB 저장
    await chatbotApi
      .post(`/${roomId}/message`, userMessage)
      .catch((err) => console.log(err));

    try {
      // 4. 봇 타이핑 시작 표시
      setIsBotTyping(true);
      // 5. FastAPI 서버에 요청 (스트리밍 응답)
      const response = await fetch(`http://localhost:8000/chat/${roomId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userInput,
          mbti: state.mbti,
          botName: state.botName,
          token: token, // 👈 토큰 추가
          nickname: nickName,
          gender: state.gender,
          talkStyle: state.talkStyle,
          age: state.age,
          personality: state.personality, // personality로 변경
          appearance: state.appearance, // appearance 추가
        }),
      });
      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder("utf-8");
      let botText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          setIsBotTyping(false); // 👈 응답 끝나면 타이핑 종료
          break;
        }
        const chunk = decoder.decode(value, { stream: true });
        botText += chunk;

        // 6. 봇 메시지 실시간 업데이트
        setMessages((prevMessages) => {
          const lastMessage = prevMessages[prevMessages.length - 1];
          if (lastMessage?.sender === "bot") {
            // 마지막 메시지가 봇 메시지면 내용 업데이트
            const newMessages = [...prevMessages];
            newMessages[newMessages.length - 1] = {
              ...lastMessage,
              content: botText,
            };
            return newMessages;
          } else {
            // 새 봇 메시지 추가
            return [
              ...prevMessages,
              {
                roomId: Number(roomId),
                sender: "bot",
                content: botText,
              },
            ];
          }
        });
      }
      // 최종 완성된 봇 응답 DB 저장
      const botMessage: SaveChatMessage = {
        roomId: Number(roomId),
        sender: "bot",
        content: botText,
      };
      await chatbotApi
        .post(`/${roomId}/message`, botMessage)
        .catch((err) => console.log(err));
    } catch (err) {
      console.error(err);
      setIsBotTyping(false);
    }
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messages}>
        {messages.map((m, i) => (
          <div
            key={`${m.roomId}-${i}`}
            className={m.sender === "user" ? styles.userWrapper : styles.botWrapper}
          >
            {m.sender === "bot" && (
              <div className={styles.botHeader}>
                {state.botProfileImageUrl && (
                  // 수정: /api 대신 /uploads 경로 사용
                  <img src={`http://localhost:8085/api${state.botProfileImageUrl}`}
                   alt="Profile" className={styles.profileImage}/> 
                )}
                <div className={styles.botName}>{state.botName}</div>
              </div>
            )}
            <div
              className={`${styles.message} ${
                m.sender === "user" ? styles.user : styles.bot
              }`}
            >
              <p className={styles.content}>{m.content}</p>
            </div>
          </div>
        ))}

        {/* 👇 챗봇 타이핑 표시 */}
        {isBotTyping && (
          <div className={styles.botWrapper}>
            <div className={styles.botHeader}>
              {state.botProfileImageUrl && (
                // 수정: /api 대신 /uploads 경로 사용
                <img src={`http://localhost:8085/api${state.botProfileImageUrl}`} alt="Profile" className={styles.profileImage}/> 
              )}
              <div className={styles.botName}>{state.botName}</div>
            </div>
            <div className={`${styles.message} ${styles.bot}`}>
              <span className={styles.typingIndicator}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className={styles.inputArea}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className={styles.input}
          placeholder="메시지를 입력하세요..."
        />
        <button type="submit" className={styles.sendBtn}>
          전송
        </button>
      </form>
    </div>
  );
}