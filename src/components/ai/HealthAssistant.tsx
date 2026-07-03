// HealthAssistant — chat bubbles UI. User right (accent), AI left (card).
import { useState } from "react";
import { Send } from "lucide-react";
import { api } from "../../lib/api";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function HealthAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    const userMsg: ChatMessage = { role: "user", content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setStreaming(true);

    const res = await api.post<{ success: boolean; data: { reply: string } }>(
      "/ai/chat",
      { messages: updatedMessages }
    );

    setStreaming(false);
    if (res.data.success) {
      const reply = res.data.data.reply;
      // Stream word by word for a warm, personal feel.
      const words = reply.split(" ");
      let built = "";
      setMessages((m) => [...m, { role: "assistant", content: "" }]);
      words.forEach((word, i) => {
        setTimeout(() => {
          built += (i === 0 ? "" : " ") + word;
          setMessages((m) => {
            const copy = [...m];
            copy[copy.length - 1] = {
              role: "assistant",
              content: built,
            };
            return copy;
          });
        }, i * 40);
      });
    }
  };

  return (
    <div className="flex h-[60vh] flex-col rounded-card bg-card shadow-card">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="mt-12 text-center text-sm text-muted">
            Your health assistant is here for you 💗
            <br />
            Ask anything about your cycle, vitals, or how you're feeling.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-card px-4 py-2 text-sm ${
                m.role === "user"
                  ? "bg-accent text-white"
                  : "bg-card-hover text-text"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {streaming && (
          <div className="flex justify-start">
            <div className="flex gap-1 rounded-card bg-card-hover px-4 py-3">
              <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:0ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:150ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:300ms]" />
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-2 border-t border-border p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Say something…"
          className="flex-1 rounded-btn border border-border bg-card-hover px-3 py-2 text-sm text-text outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={send}
          disabled={streaming || !input.trim()}
          className="tap rounded-btn bg-primary px-3 py-2 text-white disabled:opacity-50"
          aria-label="Send"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
