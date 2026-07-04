// PartnerDashboard — partner's Overview tab. Shows phase, mood, tip, pregnancy mode.
import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { usePartner, type PartnerView } from "../hooks/usePartner";
import { Spinner } from "../components/ui/Spinner";
import { api } from "../lib/api";
import { phaseColor } from "../lib/cycleUtils";

const PHASE_DESCRIPTIONS: Record<string, string> = {
  menstrual: "Her period is here. She might need extra comfort and rest today.",
  follicular: "Her energy is starting to return. A good week for plans together.",
  fertile: "She's feeling her best right now — lots of energy and good mood.",
  ovulation: "Peak day for her. She's feeling great and social.",
  luteal: "Pre-period phase. She may feel more tired or emotionally sensitive.",
};

const SUPPORT_TIPS: Record<string, string> = {
  menstrual: "Rest helps most. Offer a heating pad, her favourite drink, and a quiet evening.",
  follicular: "She's got rising energy — suggest a walk, a fun plan, or something creative together.",
  fertile: "Match her confidence. She's feeling social and open — great for quality time.",
  ovulation: "Peak energy day. She'll appreciate meaningful conversation and shared plans.",
  luteal: "Small gestures matter most. A warm drink, a back rub, or just giving space if she needs it.",
};

const PREGNANCY_TIPS: Record<string, string> = {
  first: "First trimester fatigue is real. Help with chores, let her rest, and keep snacks handy.",
  second: "Energy often returns. Enjoy the boost together — plan a babymoon or date night.",
  third: "She's uncomfortable. Offer foot rubs, help with preparations, and be patient.",
};

const PHASE_EMOJI: Record<string, string> = {
  menstrual: "🌸",
  follicular: "💙",
  fertile: "🌿",
  ovulation: "✨",
  luteal: "🌙",
};

export function PartnerDashboard() {
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const { partnerView, fetchPartnerView } = usePartner();
  const [data, setData] = useState<PartnerView | null>(null);
  const [loading, setLoading] = useState(true);
  const [notConnected, setNotConnected] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const result = await fetchPartnerView();
      if (result) {
        if ((result as any).disconnected) { setNotConnected(true); setData(null); }
        else setData(result);
      }
      else setNotConnected(true);
      setLoading(false);
    };
    load();
  }, [user]);

  if (role === "tracker") return <Navigate to="/" replace />;
  if (!user) return <Navigate to="/login" replace />;

  if (loading) {
    return (
      <div className="pb-24 px-5 pt-5 space-y-5">
        <div className="h-5 w-32 rounded animate-pulse bg-card-hover" />
        <div className="rounded-card p-6 space-y-4 bg-card shadow-card"><div className="h-4 w-24 rounded animate-pulse bg-card-hover" /><div className="h-8 w-40 rounded animate-pulse bg-card-hover mx-auto" /><div className="h-4 w-60 rounded animate-pulse bg-card-hover mx-auto" /></div>
      </div>
    );
  }

  if (!data) return <PartnerCodeHome />;

  const phaseColorValue = phaseColor(data.currentPhase as any);
  const phaseLabel = data.currentPhase.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const phaseDesc = PHASE_DESCRIPTIONS[data.currentPhase] ?? "Her cycle is being tracked.";
  const isOnPeriod = data.currentPhase === "menstrual";
  const tip = data.empathyTip ?? SUPPORT_TIPS[data.currentPhase] ?? SUPPORT_TIPS.luteal;
  const emoji = PHASE_EMOJI[data.currentPhase] ?? "🌿";

  // Determine pregnancy status from view data (if she's shared it)
  const isPregnancyMode = (data as any).pregnancyWeek != null;

  return (
    <div className="pb-24">
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <h1 className="text-[20px] font-bold text-text">
          Hey{user?.displayName ? ` ${user.displayName.split(" ")[0]}` : ""}
        </h1>
        <div className="flex items-center gap-1.5 text-subtle">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
          <span className="text-[11px]">Private</span>
        </div>
      </div>

      <div className="space-y-4 px-5 pt-2">
        {/* Phase hero card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-card bg-card shadow-card p-5 text-center space-y-3 border border-primary/5">
          <div className="flex items-center justify-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-white text-[13px] font-bold">
              {data.ownerFirstName.charAt(0).toUpperCase()}
            </div>
            <span className="text-[12px] font-semibold text-muted">{data.ownerFirstName}'s cycle today</span>
          </div>
          <p className="text-[28px] font-bold" style={{ color: phaseColorValue }}>{emoji} {phaseLabel}</p>
          <p className="text-[14px] text-muted">{phaseDesc}</p>
          <p className="text-[12px] text-muted">Day {data.dayOfCycle} of {data.avgLength}</p>
          <span className="inline-block rounded-full px-4 py-1.5 text-[13px] font-semibold"
            style={{ backgroundColor: isOnPeriod ? "var(--color-period)" : `color-mix(in srgb, ${phaseColorValue} 15%, var(--color-card))`, color: isOnPeriod ? "#fff" : phaseColorValue }}>
            {isOnPeriod && data.daysIntoPeriod ? `Period · Day ${data.daysIntoPeriod}` : data.daysUntilPeriod <= 2 ? "Period arriving very soon" : `${data.daysUntilPeriod} days until period`}
          </span>
        </motion.div>

        {/* How to support today */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="rounded-card bg-card shadow-card p-5 space-y-3 border border-accent/10">
          <div className="flex items-center gap-2">
            <span className="text-[18px]">💛</span>
            <span className="text-[12px] font-semibold text-muted uppercase tracking-wide">How to support her today</span>
          </div>
          <p className="text-[14px] text-text leading-relaxed">{tip}</p>
        </motion.div>

        {/* Mood summary (if shared) */}
        {data.shareMood && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="rounded-card bg-card shadow-card p-4 flex items-center gap-3">
            <span className="text-[24px]">😊</span>
            <div>
              <p className="text-[12px] text-muted">How she's feeling</p>
              <p className="text-[14px] font-semibold text-text">{data.moodSummary ?? "Not logged today"}</p>
            </div>
          </motion.div>
        )}

        {/* Pregnancy mode card */}
        {isPregnancyMode && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="rounded-card bg-card shadow-card p-5 space-y-3 border border-primary/10">
            <div className="flex items-center gap-2">
              <span className="text-[18px]">🤰</span>
              <span className="text-[13px] font-semibold text-text">Pregnancy</span>
              <span className="ml-auto rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-semibold text-primary">Week {(data as any).pregnancyWeek ?? "—"}</span>
            </div>
            <p className="text-[14px] text-text">{(data as any).babySize ? `Baby is the size of a ${(data as any).babySize}` : "Growing strong!"}</p>
            <p className="text-[12px] text-muted">{(data as any).trimester ? `Trimester: ${(data as any).trimester}` : ""}</p>
          </motion.div>
        )}

        {/* Upcoming events */}
        {data.nextEvents.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <p className="text-[13px] font-semibold text-text mb-2">Coming up</p>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {data.nextEvents.slice(0, 3).map((ev, i) => (
                <span key={i} className="flex-shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-medium"
                  style={{ backgroundColor: `color-mix(in srgb, ${phaseColorValue} 12%, var(--color-card))`, color: phaseColorValue, border: `1px solid color-mix(in srgb, ${phaseColorValue} 25%, var(--color-border))` }}>
                  {ev.daysUntil === 0 ? `${ev.name} today` : `${ev.name} in ${ev.daysUntil}d`}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Privacy notice */}
        <p className="text-center text-[11px] text-subtle pt-2">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline mr-1"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
          {data.ownerFirstName} controls what you see.
        </p>
      </div>
    </div>
  );
}

// ─── Inline code entry ───
function PartnerCodeHome() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [validating, setValidating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const allFilled = code.every((c) => c.length === 1);

  useEffect(() => {
    if (allFilled && !validating && !success) handleSubmit();
  }, [allFilled, validating, success]);

  const handleSubmit = async () => {
    const inviteCode = code.join("").toUpperCase();
    if (inviteCode.length !== 6) return;
    setValidating(true);
    setError(null);
    try {
      const res = await api.post("/partner/accept", { inviteCode });
      if (res.data.success) { setSuccess(true); setTimeout(() => window.location.reload(), 1200); }
      else { setError((res.data as any).error ?? "Code not found"); setCode(["", "", "", "", "", ""]); inputRefs.current[0]?.focus(); }
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Code not found"); setCode(["", "", "", "", "", ""]); inputRefs.current[0]?.focus();
    } finally { setValidating(false); }
  };

  const handleChange = (index: number, value: string) => {
    const char = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(-1);
    const newCode = [...code]; newCode[index] = char; setCode(newCode); setError(null);
    if (char && index < 5) inputRefs.current[index + 1]?.focus();
  };
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    if (pasted) { const newCode = ["", "", "", "", "", ""]; for (let i = 0; i < pasted.length; i++) newCode[i] = pasted[i]; setCode(newCode); setError(null); inputRefs.current[Math.min(pasted.length, 5)]?.focus(); }
  };

  if (!user) {
    return (
      <div className="pb-24 px-5 pt-5">
        <h1 className="text-[20px] font-bold text-text mb-2">Partner</h1>
        <p className="text-[14px] text-muted mb-6">Sign in to enter a partner invite code.</p>
        <button type="button" onClick={() => navigate("/login")} className="w-full rounded-btn bg-primary text-white px-5 py-3.5 text-[15px] font-semibold cursor-pointer">Sign in</button>
      </div>
    );
  }

  return (
    <div className="pb-24 px-5 pt-5">
      <h1 className="text-[20px] font-bold text-text mb-2">Hey{user?.displayName ? ` ${user.displayName.split(" ")[0]}` : ""}</h1>
      <p className="text-[14px] text-muted mb-8">Enter your partner's invite code to get started</p>
      <div className="rounded-card bg-card shadow-card p-6 space-y-5">
        <div>
          <p className="text-[15px] font-semibold text-text mb-1">Enter invite code</p>
          <p className="text-[13px] text-muted mb-4">Ask your partner to open Atnasya, go to Profile, and tap "Connect your partner"</p>
          <div className="flex gap-2.5 justify-center" style={{ animation: error ? "shake 400ms ease-in-out" : undefined }}>
            {code.map((char, i) => (
              <input key={i} ref={(el) => { inputRefs.current[i] = el; }} type="text" maxLength={1} value={char}
                onChange={(e) => handleChange(i, e.target.value)} onKeyDown={(e) => handleKeyDown(i, e)} onPaste={handlePaste}
                disabled={validating || success}
                className={`flex h-[56px] w-[48px] items-center justify-center rounded-[12px] border-[1.5px] text-center text-[24px] font-bold uppercase outline-none transition-all duration-150 ${success ? "border-[var(--color-success)] bg-[var(--color-success)]/10" : error ? "border-[var(--color-danger)] bg-[var(--color-danger)]/5" : char ? "border-[var(--color-primary)] bg-card-hover" : "border-border bg-card-hover focus:border-[var(--color-primary)]"}`}
                style={{ color: success ? "var(--color-success)" : error ? "var(--color-danger)" : "var(--color-primary)" }} />
            ))}
          </div>
          {validating && !success && <div className="flex items-center justify-center gap-2 mt-3 text-[13px] text-muted"><div className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-primary" />Checking...</div>}
          {success && <p className="text-center mt-3 text-[13px] font-semibold text-success">Connected! Loading...</p>}
          {error && !success && <p className="text-center mt-3 text-[13px] text-danger">{error}</p>}
        </div>
        <details className="rounded-btn border border-border p-3"><summary className="text-[13px] font-medium text-primary cursor-pointer">Don't have a code yet?</summary><p className="mt-2 text-[12px] text-muted">Ask your partner to open Atnasya, go to Profile, and tap "Connect your partner".</p></details>
      </div>
    </div>
  );
}
