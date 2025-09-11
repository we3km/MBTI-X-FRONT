import { useState, useEffect, useRef } from "react";
import { chatbotApi } from "../../api/chatbot/catbotApi";
import styles from "./Chat.module.css";
import { store } from "../../store/store";
import { FaPaperclip, FaTimes } from "react-icons/fa";

interface ChatMessage {
  roomId: number;
  sender: "user" | "bot";
  content: string;
  messageType?: "text" | "image" | "file";
  fileUrl?: string;
}

interface ChatProps {
  roomId: string;
  state: {
    mbti: string;
    botName: string;
    gender: string;
    talkStyle: string;
    age: number;
    features: string;
  };
}

export default function Chat({ roomId, state }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const token = store.getState().auth.accessToken;
  const nickName = store.getState().auth.user?.nickname;

  useEffect(() => {
    chatbotApi
      .get(`/${roomId}/messages`)
      .then((res) => setMessages(res.data))
      .catch((err) => console.log(err));
  }, [roomId]);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      if (selected.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(selected);
      } else {
        setPreview(selected.name);
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !file) return;

    const formData = new FormData();
    formData.append("message", input);
    formData.append("mbti", state.mbti);
    formData.append("botName", state.botName);
    formData.append("token", token || "");
    formData.append("nickname", nickName || "사용자");
    formData.append("gender", state.gender);
    formData.append("talkStyle", state.talkStyle);
    formData.append("age", String(state.age));
    formData.append("features", state.features);
    if (file) formData.append("file", file);

    // UI 먼저 반영 (임시 URL)
    const userMessage: ChatMessage = {
      roomId: Number(roomId),
      sender: "user",
      content: input || (file ? file.name : ""),
      messageType: file
        ? file.type.startsWith("image/")
          ? "image"
          : "file"
        : "text",
      fileUrl: file ? URL.createObjectURL(file) : undefined,
    };
    setMessages((prev) => [...prev, userMessage]);

    setInput("");
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    try {
      // 서버에 메시지 + 파일 전송
      const response = await fetch(`http://localhost:8000/chat/${roomId}`, {
        method: "POST",
        body: formData,
      });

      // 챗봇 응답 스트리밍
      const reader = response.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder("utf-8");
      let botText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        botText += chunk;

        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.sender === "bot") {
            return [...prev.slice(0, -1), { ...last, content: botText }];
          } else {
            return [
              ...prev,
              {
                roomId: Number(roomId),
                sender: "bot",
                content: botText,
                messageType: "text",
              },
            ];
          }
        });
      }

      // 챗봇 메시지는 서버에서 이미 DB 저장됨
    } catch (err) {
      console.error(err);
    }
  };

  const renderMessageContent = (msg: ChatMessage) => {
    switch (msg.messageType) {
      case "image":
        return (
          <>
            <img
              src={msg.fileUrl || msg.content}
              alt="uploaded"
              className={styles.messageImage}
            />
            {msg.content && <p className={styles.content}>{msg.content}</p>}
          </>
        );
      case "file":
        return (
          <div className={styles.fileAttachment}>
            <a href={msg.fileUrl || msg.content} target="_blank" rel="noreferrer">
              📄 {msg.content || "첨부 파일"}
            </a>
          </div>
        );
      default:
        return <p className={styles.content}>{msg.content}</p>;
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
              <div className={styles.botName}>{state.botName}</div>
            )}
            <div
              className={`${styles.message} ${
                m.sender === "user" ? styles.user : styles.bot
              }`}
            >
              {renderMessageContent(m)}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {preview && (
        <div className={styles.previewContainer}>
          {file?.type.startsWith("image/") ? (
            <img src={preview} alt="preview" className={styles.imagePreview} />
          ) : (
            <div className={styles.filePreview}>📄 {preview}</div>
          )}
          <button
            type="button"
            onClick={handleRemoveFile}
            className={styles.removeFileBtn}
          >
            <FaTimes />
          </button>
        </div>
      )}

      <form onSubmit={sendMessage} className={styles.inputArea}>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <button
          type="button"
          className={styles.attachBtn}
          onClick={() => fileInputRef.current?.click()}
        >
          <FaPaperclip />
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className={styles.input}
          placeholder="메시지를 입력하세요..."
        />
        <button type="submit" className={styles.sendBtn}>
          보내기
        </button>
      </form>
    </div>
  );
}
