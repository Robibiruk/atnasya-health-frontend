// SecretChat — PIN gate + private journal UI.
import { useState } from "react";
import { api } from "../../lib/api";
import type { ChatMessage } from "../../types";
import { Lock, Send } from "lucide-react";
import { Card } from "../ui/Card";

const PIN = "0000"; // PIN stored locally for this private app

export function SecretChat() {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const tryUnlock = async () => {
    if (pin === PIN) {
      setUnlocked(true);
      setError(null);
      const res = await api.get<{ success: boolean; data: ChatMessage[] }>(
        "/secret/messages"
      );
      if (res.data.success) setMessages(res.data.data);
    } else {
      setError("Incorrect PIN");
    }
  };

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setLoading(true);
    const res = await api.post<{ success: boolean; data: ChatMessage }>(
      "/secret/messages",
      { sender: "user", message: text }
    );
    if (res.data.success) setMessages((m) => [res.data.data, ...m]);
    setLoading(false);
  };

  if (!unlocked) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <Lock className="h-10 w-10 text-primary" />
        <h2 className="text-lg font-bold text-text">Private journal</h2>
        <p className="text-center text-sm text-muted">
          Enter your PIN to unlock this space. It's yours alone.
        </p>
        <input
          type="password"
          inputMode="numeric"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="••••"
          className="w-32 rounded-btn border border-border bg-card px-3 py-2 text-center text-text outline-none focus:border-primary"
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        <button
          type="button"
          onClick={tryUnlock}
          className="tap w-full rounded-btn bg-primary px-4 py-3 font-semibold text-white"
        >
          Unlock
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-[70vh] flex-col rounded-card bg-card shadow-card">
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="mt-12 text-center text-sm text-muted">
            A quiet space just for you 🌙
          </p>
        )}
        {messages.map((m) => (
          <Card key={m._id} className="text-sm text-text">
            {m.message}
            <div className="mt-1 text-[10px] text-muted">
              {new Date(m.createdAt).toLocaleString()}
            </div>
          </Card>
        ))}
      </div>
      <div className="flex gap-2 border-t border-border p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Write something private…"
          className="flex-1 rounded-btn border border-border bg-card-hover px-3 py-2 text-sm text-text outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={send}
          disabled={loading || !input.trim()}
          className="tap rounded-btn bg-primary px-3 py-2 text-white disabled:opacity-50"
          aria-label="Send"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
