import { useState, useEffect, useRef } from "react";

interface ChatMessage {
  sender: "user" | "bot";
  text: string;
}

interface ChatProps {
  mbti: string;
}

export default function Chat({ mbti }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessage = { sender: "user", text: input };
    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput("");

    try {
      const res = await fetch(`http://localhost:8000/chat/user1/${mbti}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message:userInput })
      });

      if (!res.body) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let botText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        botText += decoder.decode(value);
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.sender === "bot") {
            return [...prev.slice(0, -1), { sender: "bot", text: botText }];
          } else {
            return [...prev, { sender: "bot", text: botText }];
          }
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: 10, maxWidth: 500 }}>
      <div style={{ height: 400, overflowY: "auto", marginBottom: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ textAlign: m.sender === "user" ? "right" : "left", margin: "5px 0" }}>
            <b>{m.sender === "user" ? "You" : "Bot"}:</b> {m.text}
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
