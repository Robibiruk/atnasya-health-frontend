// AIChatFAB — floating bottom-left launcher with 2 options:
// AI Assistant + Chat History. FAB position is permanently left.
import { useState, useEffect, useMemo } from "react";
import { MessageSquare, History } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../lib/api";
import { useTranslation } from "react-i18next";

type Mode = "assistant" | "history" | null;

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

interface StoredChatItem {
  id: string;
  sender: "user" | "assistant";
  message: string;
  createdAt: string;
}

export function AIChatFAB() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>(null);
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [greeted, setGreeted] = useState(false);
  const [history, setHistory] = useState<StoredChatItem[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [params, setParams] = useState<{ limit: number; offset: number }>({ limit: 50, offset: 0 });
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const currentDate = useMemo(() => new Date().toISOString(), []);
  const todayLabel = useMemo(() => new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }), []);

  const isAssistant = mode === "assistant";
  const isHistory = mode === "history";

  const reset = () => {
    setOpen(false);
    setMode(null);
    setMessages([]);
    setInput("");
    setLoading(false);
    setGreeted(false);
    setHistory([]);
    setHistoryLoaded(false);
  };

  const pickMode = (next: Mode) => {
    setGreeted(false);
    setMode(next);
    setOpen(false);
  };

  const loadHistory = async () => {
    try {
      const res = await api.get<{ success: boolean; data: StoredChatItem[] | { items: StoredChatItem[]; total: number; offset: number; limit: number } }>("/ai/history");
      const raw = res.data.data;
      const items = Array.isArray(raw) ? raw : raw?.items ?? [];
      setHistory(items);
      setHistoryTotal(Array.isArray(raw) ? items.length : raw?.total ?? items.length);
      setParams({
        limit: Array.isArray(raw) ? items.length : raw?.limit ?? 50,
        offset: Array.isArray(raw) ? 0 : raw?.offset ?? 0,
      });
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoaded(true);
    }
  };

  useEffect(() => {
    if (isHistory) {
      loadHistory();
    }
  }, [isHistory]);

  const assistantDefault =
    isRTL
      ? "أنا هنا لدورتك، مزاجك، أعراضك، أو أي شيء تشعرين به."
      : "I'm here for your cycle, mood, symptoms, or anything you're feeling.";

  const send = async () => {
    const text = input.trim();
    if (!text || !isAssistant) return;
    setInput("");
    const userMsg: ChatTurn = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setLoading(true);
    setGreeted(true);

    try {
      const payload = {
        messages: updated.map((m) => ({ role: m.role, content: m.content })),
      };

      const res = await api.post<{ success: boolean; data: { reply?: string } }>(
        "/ai/chat",
        payload,
      );

      const replyText =
        res.data.data.reply ??
        "I'm having trouble connecting right now. Please try again in a moment.";
      setMessages((m) => [...m, { role: "assistant", content: replyText }]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "I'm having trouble connecting right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={`fixed bottom-20 left-4 z-[65] md:bottom-24 md:left-6`}>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-3 flex flex-col items-start gap-2"
            >
              <button
                type="button"
                onClick={() => pickMode("assistant")}
                className="tap flex items-center gap-2 rounded-2xl bg-card px-4 py-3 shadow-card border border-border"
              >
                <MessageSquare className="h-4 w-4 text-primary" />
                <span className="text-[13px] font-semibold text-text">AI Assistant</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("history");
                  setOpen(false);
                }}
                className="tap flex items-center gap-2 rounded-2xl bg-card px-4 py-3 shadow-card border border-border"
              >
                <History className="h-4 w-4 text-primary" />
                <span className="text-[13px] font-semibold text-text">History</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="tap pointer-events-auto h-12 w-12 rounded-full bg-accent shadow-card"
          aria-label="Open assistant"
        >
          <MessageSquare className="mx-auto h-5 w-5 text-white" />
        </button>
      </div>

      <AnimatePresence>
        {(isAssistant || isHistory) && (
          <motion.div
            className="fixed inset-0 z-[70]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/40" onClick={reset} />
            <div className={`absolute inset-x-0 bottom-0 mx-auto max-w-[480px] md:max-w-[640px]`}>
              <div className={`mx-4 mb-4 flex items-center flex-row-reverse justify-between`}>
                <span className="text-[13px] font-semibold text-white">
                  {isAssistant ? "AI Assistant" : "Chat History"}
                </span>
                <button
                  type="button"
                  onClick={reset}
                  className="tap rounded-full bg-white/10 px-3 py-1 text-[12px] text-white"
                >
                  {isRTL ? "إغلاق" : "Close"}
                </button>
              </div>

              <div className="h-[65vh] overflow-y-auto rounded-t-2xl bg-[var(--color-card)] shadow-[0_-8px_40px_rgba(0,0,0,0.35)]">
                {isAssistant && (
                  <div className="p-4 pb-40">
                    {!greeted && messages.length === 0 && (
                      <p className="mb-4 text-center text-[13px] text-[var(--color-muted)]">
                        {assistantDefault}
                      </p>
                    )}
                    <div className="space-y-3">
                      {messages.map((m, i) => (
                        <div
                          key={`msg-${i}`}
                          className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2 text-[13px] ${
                              m.role === "user"
                                ? "bg-[var(--color-accent)] text-white"
                                : "bg-[var(--color-card-hover)] text-text"
                            }`}
                          >
                            {m.content}
                          </div>
                        </div>
                      ))}
                      {loading && (
                        <div className="flex justify-start">
                          <div className="flex gap-1 rounded-2xl bg-[var(--color-card-hover)] px-4 py-3">
                            <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--color-primary)] [animation-delay:0ms]" />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--color-primary)] [animation-delay:150ms]" />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--color-primary)] [animation-delay:300ms]" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {isHistory && (
                  <div className="p-4 pb-40">
                    {!historyLoaded && (
                      <p className="text-center text-[13px] text-[var(--color-muted)]">
                        {isRTL ? "جاري تحميل السجل..." : "Loading history..."}
                      </p>
                    )}
                    {historyLoaded && history.length === 0 && (
                      <p className="text-center text-[13px] text-[var(--color-muted)]">
                        {isRTL ? "لا يوجد سجل بعد." : "No chat history yet."}
                      </p>
                    )}
                    <div className="space-y-2">
                      {history.map((item, idx) => (
                        <div
                          key={`hist-${item.id}-${idx}`}
                          className={`flex ${item.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-3 py-2 text-[13px] ${
                              item.sender === "user"
                                ? "bg-[var(--color-accent)] text-white"
                                : "bg-[var(--color-card-hover)] text-text"
                            }`}
                          >
                            <div className="text-[11px] text-[var(--color-muted)] opacity-80">
                              {new Date(item.createdAt).toLocaleString()}
                            </div>
                            <div>{item.message}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isAssistant && (
                  <div className="absolute inset-x-0 bottom-0 border-t border-border bg-[var(--color-card)] p-3">
                    <form
                      className="flex gap-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        send();
                      }}
                    >
                      <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isRTL ? "اسألي أي شيء..." : "Ask anything..."}
                        className="flex-1 rounded-xl border border-border bg-[var(--color-card-hover)] px-3 py-2 text-[13px] text-text outline-none focus:border-[var(--color-primary)] text-start"
                      />
                      <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="tap rounded-xl bg-[var(--color-primary)] px-3 py-2 text-white disabled:opacity-50"
                      >
                        {isRTL ? "إرسال" : "Send"}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
