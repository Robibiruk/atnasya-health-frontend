// PartnerSupport — educational content, phase-specific suggestions, quick messages, shopping list.
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { usePartner, type PartnerView } from "../hooks/usePartner";
import { api } from "../lib/api";
import { Spinner } from "../components/ui/Spinner";

const PHASE_GUIDES: Record<string, { title: string; tips: string[] }> = {
  menstrual: {
    title: "Understanding her period",
    tips: [
      "Cramps are caused by prostaglandins — warmth and gentle movement help",
      "Iron levels drop: she may feel tired even with good sleep",
      "Offer a heating pad, her favourite drink, and patience",
      "Don't take mood swings personally — hormones are fluctuating rapidly",
    ],
  },
  follicular: {
    title: "Follicular phase — rising energy",
    tips: [
      "Estrogen is climbing — she's more social and energetic",
      "Great time for plans, dates, and trying new things together",
      "Her skin is likely clearing up — she may feel more confident",
      "Suggest a walk, a workout together, or a fun outing",
    ],
  },
  fertile: {
    title: "Fertile window — peak confidence",
    tips: [
      "She's at her most confident and communicative",
      "Libido is naturally higher — follow her lead",
      "Great window for meaningful conversations",
      "Enjoy the positive energy — it's temporary",
    ],
  },
  ovulation: {
    title: "Ovulation — peak day",
    tips: [
      "Today is her most fertile day",
      "Energy and mood are at their highest",
      "She may feel more attractive and social",
      "A great day for romance or celebration",
    ],
  },
  luteal: {
    title: "Luteal phase — PMS awareness",
    tips: [
      "Progesterone rises: she may feel more tired or emotional",
      "PMS can start 7-10 days before her period",
      "Small kindnesses go far: tea, a massage, giving space",
      "Cravings are real — don't judge the snack choices",
      "She may need more sleep than usual",
    ],
  },
};

const PREGNANCY_GUIDES: Record<string, { title: string; tips: string[] }> = {
  first: {
    title: "First trimester support",
    tips: [
      "Fatigue is extreme — help with daily tasks without being asked",
      "Morning sickness can hit anytime, not just morning",
      "Keep crackers or plain snacks nearby",
      "She may be anxious — listen more than you advise",
      "Attend the first ultrasound with her if she wants",
    ],
  },
  second: {
    title: "Second trimester support",
    tips: [
      "Energy often returns — enjoy activity together while it lasts",
      "She may start showing — compliment her, don't comment on size",
      "Help research baby gear and childcare options",
      "Attend birthing classes together",
      "Plan a babymoon or quiet getaway",
    ],
  },
  third: {
    title: "Third trimester support",
    tips: [
      "She's uncomfortable — offer foot rubs, back rubs, and patience",
      "Sleep is difficult — let her nap whenever she can",
      "Help pack the hospital bag and install the car seat",
      "Learn the signs of labour so you both feel prepared",
      "Be on call: she needs to know you'll drop everything",
    ],
  },
};

const QUICK_MESSAGES = [
  { emoji: "💛", text: "Thinking of you" },
  { emoji: "🌸", text: "Hope you're resting" },
  { emoji: "💪", text: "You've got this" },
  { emoji: "🎁", text: "I got you something" },
  { emoji: "☕", text: "Coffee / tea?" },
  { emoji: "🔥", text: "You're amazing" },
  { emoji: "🤗", text: "Sending a hug" },
  { emoji: "🌙", text: "Get some rest" },
];

export function PartnerSupport() {
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const { partnerView, fetchPartnerView } = usePartner();
  const [data, setData] = useState<PartnerView | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeGuide, setActiveGuide] = useState<string | null>(null);
  const [quickMsgSent, setQuickMsgSent] = useState<string | null>(null);
  const [shoppingItems, setShoppingItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2000); };

  useEffect(() => {
    if (!user) return;
    fetchPartnerView().then((r) => { if (r) setData(r); setLoading(false); });
  }, [user, fetchPartnerView]);

  if (role === "tracker") return <Navigate to="/" replace />;
  if (!user) return <Navigate to="/login" replace />;

  if (loading) return <div className="pb-24 px-5 pt-5"><Spinner /></div>;
  if (!data) return <div className="pb-24 px-5 pt-5 text-center text-muted">Connect first in the Overview tab.</div>;

  const phase = data.currentPhase || "luteal";
  const guides = PHASE_GUIDES[phase] ?? PHASE_GUIDES.luteal;

  // If pregnancy mode, show pregnancy guides
  const isPregnancy = (data as any).pregnancyWeek != null;
  const trimester = isPregnancy ? ((data as any).trimester ?? "second") : null;
  const pregGuide = trimester ? PREGNANCY_GUIDES[trimester] ?? PREGNANCY_GUIDES.second : null;

  const sendQuickMessage = async (msg: { emoji: string; text: string }) => {
    try {
      await api.post("/partner/message", { message: msg.text, emoji: msg.emoji });
      setQuickMsgSent(msg.text);
      setTimeout(() => setQuickMsgSent(null), 2500);
    } catch {
      showToast("Could not send message");
    }
  };

  const addShoppingItem = () => {
    if (!newItem.trim()) return;
    setShoppingItems((prev) => [...prev, newItem.trim()]);
    setNewItem("");
  };

  return (
    <div className="pb-24">
      <div className="px-5 pt-5 pb-2">
        <h1 className="text-[20px] font-bold text-text">Support</h1>
        <p className="text-[12px] text-muted">Learn, connect, and help</p>
      </div>

      <div className="px-5 pt-2 space-y-4">
        {/* Phase-specific education */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-card bg-card shadow-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[18px]">📖</span>
            <p className="text-[14px] font-semibold text-text">{guides.title}</p>
          </div>
          <ul className="space-y-2">
            {guides.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-muted">
                <span className="text-primary mt-0.5">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Pregnancy education */}
        {pregGuide && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-card bg-card shadow-card p-5 space-y-3 border border-primary/10">
            <div className="flex items-center gap-2">
              <span className="text-[18px]">🤰</span>
              <p className="text-[14px] font-semibold text-text">{pregGuide.title}</p>
            </div>
            <ul className="space-y-2">
              {pregGuide.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] text-muted"><span className="text-primary mt-0.5">•</span>{tip}</li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Quick message send */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-card bg-card shadow-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[18px]">💬</span>
            <p className="text-[14px] font-semibold text-text">Send a quick thought</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_MESSAGES.map((msg) => (
              <button key={msg.text} type="button" onClick={() => sendQuickMessage(msg)}
                className="rounded-full bg-card-hover px-3.5 py-2 text-[12px] font-medium cursor-pointer hover:bg-primary/10 transition-colors">
                {msg.emoji} {msg.text}
              </button>
            ))}
          </div>
          {quickMsgSent && <p className="text-[12px] font-semibold text-success animate-fade-up">"{quickMsgSent}" sent! 💌</p>}
        </motion.div>

        {/* Shopping / reminder list */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-card bg-card shadow-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[18px]">🛒</span>
            <p className="text-[14px] font-semibold text-text">Shopping & reminder list</p>
          </div>
          {shoppingItems.length > 0 && (
            <div className="space-y-1.5">
              {shoppingItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between rounded-btn bg-card-hover px-3 py-2">
                  <span className="text-[13px] text-text">{item}</span>
                  <button type="button" onClick={() => setShoppingItems((prev) => prev.filter((_, j) => j !== i))}
                    className="text-[12px] text-muted cursor-pointer hover:text-danger">✕</button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input value={newItem} onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addShoppingItem(); }}
              placeholder="Add an item..." className="flex-1 rounded-btn border border-border bg-card px-3 py-2.5 text-[13px] text-text outline-none focus:border-primary" />
            <button type="button" onClick={addShoppingItem} disabled={!newItem.trim()}
              className="rounded-btn bg-primary px-4 py-2.5 text-[13px] font-semibold text-white cursor-pointer disabled:opacity-50">Add</button>
          </div>
        </motion.div>

        {/* Resources */}
        <details className="rounded-card bg-card shadow-card p-4">
          <summary className="text-[13px] font-semibold text-text cursor-pointer">📚 Resources for partners</summary>
          <div className="mt-3 space-y-2">
            {[
              "Understanding PMS: It's biological, not personal",
              "How to support during labour: a partner's guide",
              "Postpartum: what to expect emotionally",
              "Birth plan basics: how to be her advocate",
            ].map((r, i) => (
              <div key={i} className="rounded-btn bg-card-hover px-3 py-2.5 text-[12px] text-muted cursor-pointer hover:text-text">
                {r}
              </div>
            ))}
          </div>
        </details>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 rounded-full bg-primary px-5 py-2.5 text-[13px] font-semibold text-white shadow-card animate-fade-up">
          {toast}
        </div>
      )}
    </div>
  );
}
