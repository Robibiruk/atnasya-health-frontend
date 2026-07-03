// Selfcare — comprehensive wellness hub with all features.
import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TopBar } from "../components/layout/TopBar";
import { InsightCarousel } from "../components/ai/InsightCarousel";
import { VitalChart } from "../components/vitals/VitalChart";
import { BottomSheet } from "../components/ui/BottomSheet";
import { useSelfcare } from "../hooks/useSelfcare";
import { useVitals } from "../hooks/useVitals";
import { useCycleStore } from "../store/cycleStore";
import { Spinner } from "../components/ui/Spinner";
import {
  getPhaseTip,
  getMoodTriggeredContent,
  getNutritionForPhase,
  getYogaForPhase,
  DAILY_TIPS,
  WELLNESS_ARTICLES,
  BREATHING_EXERCISES,
  MEDITATIONS,
  YOGA_ROUTINES,
  SLEEP_STORIES,
  NUTRITION_SUGGESTIONS,
  MOOD_TRIGGERED_CONTENT,
  TRIMESTER_CHECKLISTS,
} from "../lib/wellnessData";
import {
  PERIOD_RELIEF_VIDEOS,
  PHASE_YOGA_VIDEOS,
  ALL_YOGA_VIDEOS,
  type YogaVideo,
} from "../lib/yogaVideos";
import {
  SOUNDSCAPES,
  getDailyAffirmation,
  type Soundscape,
} from "../lib/soundscapes";
import type {
  SelfcareCard,
  InsightCard,
  WellnessArticle,
  GuidedBreathing,
  Meditation,
  YogaRoutine,
  SleepStory,
  NutritionSuggestion,
  DailyTip,
  SelfCareReminder,
  TrimesterChecklistItem,
  MonthlyWellnessProgress,
  CyclePhase,
} from "../types";

// ========== HELPERS ==========
function selfcareCardToInsightCard(card: SelfcareCard): InsightCard {
  const parts: string[] = [];
  if (card.mood !== null) parts.push(`Mood: ${card.mood}/5`);
  if (card.water !== null) parts.push(`Water: ${card.water} glasses`);
  if (card.sleep !== null) parts.push(`Sleep: ${card.sleep}h`);
  if (card.energy !== null) parts.push(`Energy: ${card.energy}/5`);
  const body = parts.join(" | ") || (card.notes ?? "No details logged");
  return {
    cardType: "wellness",
    emoji: "🌿",
    title: `Self-care — ${card.date}`,
    body: body + (card.notes ? ` — ${card.notes}` : ""),
  };
}

// ========== SVG ICONS ==========
function BreathingIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12h3l2-3 3 6 2-3 2 3 3-3 3 3h2" />
    </svg>
  );
}

function ArticleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  );
}

function MeditationIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="3" /><path d="M12 22v-4l-3-3 3-3 3 3-3 3v4" /><path d="M5 18l2-3" /><path d="M19 18l-2-3" />
    </svg>
  );
}

function YogaIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="1" /><path d="M12 13v7" /><path d="M8 22l4-7 4 7" /><path d="M6 11l6-3 6 3" />
    </svg>
  );
}

function NutritionIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 010 8h-1" /><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
    </svg>
  );
}

function SleepStoryIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}

function ProgressIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  );
}

function ReminderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

// ========== SECTION HEADER ==========
function SectionHeader({ emoji, icon, title, subtitle }: { emoji?: string; icon?: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      {icon ? <span className="flex h-8 w-8 items-center justify-center">{icon}</span> : emoji ? <span className="text-[22px]">{emoji}</span> : null}
      <div>
        <h2 className="text-[17px] font-bold text-text">{title}</h2>
        {subtitle && <p className="text-[12px] text-muted">{subtitle}</p>}
      </div>
    </div>
  );
}

function LibraryHeader({ image, fallbackIcon, title, subtitle }: { image?: string; fallbackIcon?: React.ReactNode; title: string; subtitle?: string }) {
  const [imgError, setImgError] = useState(false);
  const showImage = !!image && !imgError;
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white/60">
        {showImage ? (
          <img src={image} alt={title} className="h-8 w-8 object-cover" onError={() => setImgError(true)} />
        ) : fallbackIcon ? (
          fallbackIcon
        ) : null}
      </span>
      <div>
        <h2 className="text-[17px] font-bold text-text">{title}</h2>
        {subtitle && <p className="text-[12px] text-muted">{subtitle}</p>}
      </div>
    </div>
  );
}

// ========== DAILY TIP CARD ==========
function DailyTipCard({ tip }: { tip: DailyTip | null }) {
  if (!tip) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-card bg-gradient-to-br from-primary/10 to-accent/10 shadow-card p-5 border border-primary/10">
      <div className="flex items-start gap-3">
        <span className="text-[24px] mt-0.5">💡</span>
        <div>
          <p className="text-[13px] font-medium text-text">{tip.tip}</p>
          <span className="mt-1.5 inline-block rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-semibold text-primary capitalize">{tip.category}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ========== MOOD TRIGGERED CARD ==========
function MoodTriggeredCard({ mood, onAction }: { mood: number | null; onAction: (type: string, refId: string) => void }) {
  const content = getMoodTriggeredContent(mood);
  if (!content) return null;
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-card bg-card shadow-card p-5 border border-accent/20">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[18px]">💛</span>
        <span className="text-[12px] font-semibold text-accent">Feeling low? Try this</span>
      </div>
      <p className="text-[14px] font-semibold text-text mb-1">{content.title}</p>
      <p className="text-[13px] text-muted mb-3">{content.body}</p>
      <button
        type="button"
        onClick={() => onAction(content.type, content.refId)}
        className="rounded-full bg-accent px-4 py-1.5 text-[12px] font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity"
      >
        {content.type === "breathing" ? "Breathe with me" : content.type === "meditation" ? "Start meditation" : content.type === "yoga" ? "Start yoga" : "Read tip"}
      </button>
    </motion.div>
  );
}

// ========== QUICK LOG SECTION ==========
function QuickLogSection({ onLog }: { onLog: (field: string) => void }) {
  const logButtons = [
    { field: "mood", emoji: "😊", label: "Mood" },
    { field: "water", emoji: "💧", label: "Water" },
    { field: "sleep", emoji: "😴", label: "Sleep" },
    { field: "energy", emoji: "⚡", label: "Energy" },
    { field: "symptoms", emoji: "🌿", label: "Symptoms" },
  ];
  return (
    <div>
      <p className="text-[12px] font-semibold text-muted mb-2 uppercase tracking-wide">Quick check-in</p>
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {logButtons.map((b) => (
          <button
            key={b.field}
            type="button"
            onClick={() => onLog(b.field)}
            className="flex flex-col items-center gap-1 flex-shrink-0 rounded-btn bg-card-hover px-4 py-3 cursor-pointer hover:bg-primary/10 transition-all duration-150"
          >
            <span className="text-[20px]">{b.emoji}</span>
            <span className="text-[11px] font-medium text-muted">{b.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ========== BREATHING EXERCISE CARD ==========
function BreathingCard({ exercise, onStart }: { exercise: GuidedBreathing; onStart: (e: GuidedBreathing) => void }) {
  return (
    <button
      type="button"
      onClick={() => onStart(exercise)}
      className="flex-shrink-0 w-[180px] rounded-btn bg-card shadow-card p-4 text-left cursor-pointer hover:scale-[1.02] transition-transform duration-150"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: exercise.color + "22", color: exercise.color }}>
          <BreathingIcon className="h-4 w-4" />
        </span>
        <span className="text-[11px] font-semibold" style={{ color: exercise.color }}>{exercise.pattern}</span>
      </div>
      <p className="text-[13px] font-semibold text-text mb-1">{exercise.name}</p>
      <p className="text-[11px] text-muted line-clamp-2">{exercise.description}</p>
      <p className="mt-1.5 text-[10px] font-medium" style={{ color: exercise.color }}>{exercise.cycles} cycles</p>
    </button>
  );
}

// ========== MEDITATION CARD ==========
function MeditationCard({ item, onStart }: { item: Meditation; onStart: (m: Meditation) => void }) {
  const [imgError, setImgError] = useState(false);
  const showImage = item.image && !imgError;
  return (
    <button
      type="button"
      onClick={() => onStart(item)}
      className="flex-shrink-0 w-[160px] rounded-btn bg-card shadow-card p-4 text-left cursor-pointer hover:scale-[1.02] transition-transform duration-150"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full mb-2 overflow-hidden" style={{ backgroundColor: item.color + "22" }}>
        {showImage ? (
          <img src={item.image} alt={item.title} className="h-10 w-10 object-cover" onError={() => setImgError(true)} />
        ) : (
          <MeditationIcon className="h-5 w-5" style={{ color: item.color }} />
        )}
      </div>
      <p className="text-[13px] font-semibold text-text mb-1">{item.title}</p>
      <div className="flex items-center gap-2">
        <span className="text-[11px]" style={{ color: item.color }}>{item.duration} min</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-card-hover text-muted">{item.phase !== "any" ? item.phase : "all phases"}</span>
      </div>
    </button>
  );
}

// ========== YOGA CARD ==========
function YogaCard({ routine, onStart }: { routine: YogaRoutine; onStart: (r: YogaRoutine) => void }) {
  const [imgError, setImgError] = useState(false);
  const showImage = routine.image && !imgError;
  return (
    <button
      type="button"
      onClick={() => onStart(routine)}
      className="flex-shrink-0 w-[180px] rounded-btn bg-card shadow-card p-4 text-left cursor-pointer hover:scale-[1.02] transition-transform duration-150"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full mb-2 overflow-hidden" style={{ backgroundColor: routine.color + "22" }}>
        {showImage ? (
          <img src={routine.image} alt={routine.title} className="h-10 w-10 object-cover" onError={() => setImgError(true)} />
        ) : (
          <YogaIcon className="h-5 w-5" style={{ color: routine.color }} />
        )}
      </div>
      <p className="text-[13px] font-semibold text-text mb-1">{routine.title}</p>
      <p className="text-[11px] text-muted line-clamp-2">{routine.description}</p>
      <div className="mt-2 flex gap-1 flex-wrap">
        <span className="text-[10px] font-medium" style={{ color: routine.color }}>{routine.duration} min</span>
        <span className="text-[10px] text-muted">· {routine.poses.length} poses</span>
      </div>
    </button>
  );
}

// ========== SLEEP STORY CARD ==========
function SleepStoryCard({ story, onPlay }: { story: SleepStory; onPlay: (s: SleepStory) => void }) {
  return (
    <button
      type="button"
      onClick={() => onPlay(story)}
      className="flex-shrink-0 w-[160px] rounded-btn bg-card shadow-card p-4 text-left cursor-pointer hover:scale-[1.02] transition-transform duration-150"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/15 text-indigo-500 mb-2">
        <SleepStoryIcon className="h-5 w-5" />
      </div>
      <p className="text-[13px] font-semibold text-text mb-1">{story.title}</p>
      <p className="text-[11px] text-muted mb-2 line-clamp-2">{story.description}</p>
      <div className="flex items-center gap-2 text-[10px] text-muted">
        <span>🎙️ {story.narrator}</span>
        <span>·</span>
        <span>{story.duration} min</span>
      </div>
    </button>
  );
}

// ========== NUTRITION CARD ==========
function NutritionCard({ suggestion }: { suggestion: NutritionSuggestion | null }) {
  if (!suggestion) return null;
  return (
    <div className="rounded-card bg-card shadow-card p-5 border border-green-500/10">
      <div className="flex items-center gap-2 mb-2">
        <NutritionIcon className="h-5 w-5 text-green-500" />
        <span className="text-[13px] font-semibold text-text">{suggestion.title}</span>
      </div>
      <p className="text-[12px] text-muted mb-2">{suggestion.benefits}</p>
      <div className="flex flex-wrap gap-1.5">
        {suggestion.foods.map((food) => (
          <span key={food} className="rounded-full bg-green-500/10 px-2.5 py-0.5 text-[11px] font-medium text-green-600">{food}</span>
        ))}
      </div>
    </div>
  );
}

// ========== ARTICLE CARD ==========
function ArticleCard({ article }: { article: WellnessArticle }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-card bg-card shadow-card p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">{article.category}</span>
        <span className="text-[10px] text-muted">· {article.readTime} min read</span>
      </div>
      <p className="text-[14px] font-semibold text-text mb-1">{article.title}</p>
      <p className="text-[12px] text-muted">{expanded ? article.content : article.summary}</p>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="mt-1.5 text-[12px] font-semibold text-primary cursor-pointer hover:underline"
      >
        {expanded ? "Show less" : "Read more"}
      </button>
    </div>
  );
}

// ========== BREATHING EXERCISE PLAYER ==========
function BreathingPlayer({ exercise, onClose }: { exercise: GuidedBreathing; onClose: () => void }) {
  const [phase, setPhase] = useState<"inhale" | "hold1" | "exhale" | "hold2" | "rest">("inhale");
  const [progress, setProgress] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);

  useEffect(() => {
    if (cycleCount >= exercise.cycles) { onClose(); return; }
    const timings: Record<string, number> = {
      inhale: exercise.inhale,
      hold1: exercise.hold || 0,
      exhale: exercise.exhale,
      hold2: exercise.hold || 0,
      rest: 1,
    };
    const steps = ["inhale", "hold1", "exhale", "hold2", "rest"];
    const currentStepTime = timings[phase] * 1000;
    const interval = 50;
    const increments = currentStepTime / interval;
    let count = 0;

    const t = setInterval(() => {
      count++;
      setProgress(count / increments);
      if (count >= increments) {
        clearInterval(t);
        const idx = steps.indexOf(phase);
        if (idx < steps.length - 1) {
          setPhase(steps[idx + 1] as typeof phase);
        } else {
          setPhase("inhale");
          setCycleCount((c) => c + 1);
        }
        setProgress(0);
      }
    }, interval);
    return () => clearInterval(t);
  }, [phase, exercise, cycleCount, onClose]);

  const phaseLabels: Record<string, string> = { inhale: "Breathe In", hold1: "Hold", exhale: "Breathe Out", hold2: "Hold", rest: "Rest" };
  const phaseEmoji: Record<string, string> = { inhale: "⬆️", hold1: "⏸️", exhale: "⬇️", hold2: "⏸️", rest: "✨" };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="rounded-card bg-card shadow-card p-8 text-center space-y-4">
      <p className="text-[11px] font-semibold text-muted uppercase tracking-wider">{exercise.name} · {exercise.pattern}</p>
      <p className="text-[48px]">{phaseEmoji[phase]}</p>
      <p className="text-[18px] font-bold text-text">{phaseLabels[phase]}</p>
      {/* Progress ring */}
      <div className="flex justify-center">
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="34" fill="none" stroke="var(--color-border)" strokeWidth="6" />
          <circle cx="40" cy="40" r="34" fill="none" stroke={exercise.color} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 34}`}
            strokeDashoffset={`${2 * Math.PI * 34 * (1 - progress)}`}
            transform="rotate(-90 40 40)"
            style={{ transition: "stroke-dashoffset 0.05s linear" }}
          />
        </svg>
      </div>
      <p className="text-[13px] text-muted">Cycle {cycleCount + 1} of {exercise.cycles}</p>
      <button type="button" onClick={onClose} className="rounded-full border border-border px-5 py-2 text-[13px] font-semibold text-muted cursor-pointer hover:bg-card-hover">
        End session
      </button>
    </motion.div>
  );
}

// ========== MEDITATION PLAYER (SIMPLIFIED) ==========
function MeditationPlayer({ meditation, onClose }: { meditation: Meditation; onClose: () => void }) {
  const [timeLeft, setTimeLeft] = useState(meditation.duration * 60);
  const [imgError, setImgError] = useState(false);
  const showImage = !!meditation.image && !imgError;

  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="rounded-card bg-card shadow-card p-6 sm:p-8 text-center space-y-4">
      <div className="flex justify-center">
        <span className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full" style={{ backgroundColor: meditation.color + "22" }}>
          {showImage ? (
            <img src={meditation.image} alt={meditation.title} className="h-24 w-24 object-cover" onError={() => setImgError(true)} />
          ) : (
            <MeditationIcon className="h-12 w-12" style={{ color: meditation.color }} />
          )}
        </span>
      </div>
      <div>
        <p className="text-[16px] font-bold text-text">{meditation.title}</p>
        <p className="text-[13px] text-muted">{meditation.description}</p>
      </div>
      <p className="text-[40px] font-bold text-text tabular-nums">{String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}</p>
      <button type="button" onClick={onClose} className="rounded-full border border-border px-5 py-2 text-[13px] font-semibold text-muted cursor-pointer hover:bg-card-hover">
        {timeLeft <= 0 ? "Finish" : "End session"}
      </button>
    </motion.div>
  );
}

// ========== YOGA PLAYER (SIMPLIFIED) ==========
function YogaPlayer({ routine, onClose }: { routine: YogaRoutine; onClose: () => void }) {
  const [currentPose, setCurrentPose] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [imgError, setImgError] = useState(false);
  const showImage = !!routine.image && !imgError;

  useEffect(() => {
    if (currentPose >= routine.poses.length) { onClose(); return; }
    const t = setInterval(() => {
      setTimeLeft((s) => { if (s <= 1) { setCurrentPose((p) => p + 1); return 30; } return s - 1; });
    }, 1000);
    return () => clearInterval(t);
  }, [currentPose, routine.poses.length, onClose]);

  if (currentPose >= routine.poses.length) return null;
  const totalPoses = routine.poses.length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-card bg-card shadow-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-muted uppercase">{currentPose + 1} / {totalPoses}</p>
        <button type="button" onClick={onClose} className="text-[12px] text-muted cursor-pointer hover:text-text">Close</button>
      </div>
      <div className="flex flex-col items-center gap-3">
        <span className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full" style={{ backgroundColor: routine.color + "22" }}>
          {showImage ? (
            <img src={routine.image} alt={routine.title} className="h-20 w-20 object-cover" onError={() => setImgError(true)} />
          ) : (
            <YogaIcon className="h-10 w-10" style={{ color: routine.color }} />
          )}
        </span>
        <div className="text-center">
          <p className="text-[18px] font-bold text-text">{routine.title}</p>
          <p className="text-[13px] text-muted">{routine.poses[currentPose]}</p>
          <p className="text-[12px] text-muted">Hold for {timeLeft}s</p>
        </div>
      </div>
      <div className="w-full bg-border rounded-full h-1.5">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${((currentPose + 1) / totalPoses) * 100}%`, backgroundColor: routine.color }} />
      </div>
    </motion.div>
  );
}

// ========== SLEEP STORY PLAYER (YouTube embed) ==========
function SleepStoryPlayer({ story, onClose }: { story: SleepStory; onClose: () => void }) {
  const [playing, setPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(story.duration * 60);
  const playerRef = useRef<HTMLIFrameElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Extract YouTube video ID from embed URL
  const videoId = story.videoUrl?.match(/embed\/([\w-]+)/)?.[1] || "";

  const togglePlay = () => {
    setPlaying((p) => !p);
    if (playerRef.current?.contentWindow) {
      playerRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: playing ? "pauseVideo" : "playVideo", args: "" }),
        "*"
      );
    }
  };

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setTimeLeft((s) => Math.max(0, s - 1));
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing]);

  // Auto-close when timer runs out
  useEffect(() => {
    if (timeLeft <= 0) onClose();
  }, [timeLeft, onClose]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const progress = story.duration * 60 > 0 ? 1 - timeLeft / (story.duration * 60) : 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-card bg-gradient-to-br from-indigo-500/10 to-purple-500/10 shadow-card p-6 space-y-4 border border-indigo-500/20 relative overflow-hidden">
      {/* Invisible YouTube player */}
      {videoId && (
        <iframe
          ref={playerRef}
          src={`https://www.youtube.com/embed/${videoId}?autoplay=0&controls=0&showinfo=0&rel=0&enablejsapi=1`}
          className="absolute opacity-0 pointer-events-none"
          style={{ width: 1, height: 1 }}
          title={story.title}
          allow="autoplay"
        />
      )}

      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-muted uppercase">Sleep story</p>
        <button type="button" onClick={onClose} className="text-[12px] text-muted cursor-pointer hover:text-text">Close</button>
      </div>

      <div className="text-center space-y-2">
        <div className="flex h-14 w-14 items-center justify-center rounded-full mx-auto bg-indigo-500/20 text-indigo-500">
          <SleepStoryIcon className="h-7 w-7" />
        </div>
        <p className="text-[16px] font-bold text-text">{story.title}</p>
        <p className="text-[12px] text-muted">Narrated by {story.narrator}</p>
        <p className="text-[13px] text-muted">{story.description}</p>
      </div>

      {/* Audio bar — play/pause + time + progress */}
      <div className="flex items-center gap-3 px-2">
        <button
          type="button"
          onClick={togglePlay}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500 text-white cursor-pointer hover:opacity-90 transition-opacity flex-shrink-0"
        >
          {playing ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <div className="flex-1">
          <div className="w-full bg-white/10 rounded-full h-1.5">
            <div className="h-full rounded-full bg-indigo-500 transition-all duration-1000" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>
        <span className="text-[13px] font-semibold text-muted tabular-nums whitespace-nowrap">{String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}</span>
      </div>

      {/* Heartbeat animation when playing */}
      {playing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.15, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-indigo-500 pointer-events-none"
        />
      )}
    </motion.div>
  );
}

// ========== ARTICLE LIBRARY ==========
function ArticleLibrary({ articles }: { articles: WellnessArticle[] }) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const categories = ["all", ...new Set(articles.map((a) => a.category))];
  const filtered = activeCategory === "all" ? articles : articles.filter((a) => a.category === activeCategory);

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold capitalize cursor-pointer transition-colors ${
              activeCategory === cat ? "bg-primary text-white" : "bg-card-hover text-muted"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="space-y-2.5">
        {filtered.map((article) => <ArticleCard key={article.id} article={article} />)}
      </div>
    </div>
  );
}

// ========== REMINDER SCHEDULER ==========
const EMOJI_OPTIONS = ["💧", "💊", "🤸", "😴", "🔔", "🧘", "📖", "🍎", "🏃", "🌙", "💪", "🧠", "☕", "🥗", "🎵", "✨", "🌸", "🔥"];

function ReminderScheduler({ reminders, onAdd, onToggle, onRemove, onRename, onUpdate }: {
  reminders: SelfCareReminder[];
  onAdd: () => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onUpdate: (id: string, updates: Partial<SelfCareReminder>) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [pickerId, setPickerId] = useState<string | null>(null);
  const today = new Date().getDay();

  const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const toggleDay = (id: string, day: number) => {
    const r = reminders.find((x) => x.id === id);
    if (!r) return;
    const days = r.days.includes(day)
      ? r.days.filter((d) => d !== day)
      : [...r.days, day].sort();
    onUpdate(id, { days });
  };

  return (
    <div className="space-y-2.5">
      {reminders.length === 0 && <p className="text-[13px] text-muted text-center py-3">No reminders set yet.</p>}
      {reminders.map((r) => (
        <div key={r.id} className="rounded-btn bg-card-hover px-4 py-3 space-y-2">
          {/* Row 1: emoji + title + toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {/* Editable emoji */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setPickerId(pickerId === r.id ? null : r.id)}
                  className="text-[20px] cursor-pointer hover:scale-110 transition-transform"
                >
                  {r.emoji}
                </button>
                {pickerId === r.id && (
                  <div className="absolute bottom-full left-0 mb-2 z-10 w-[216px] rounded-card bg-card shadow-[0_4px_20px_rgba(0,0,0,0.3)] border border-border p-2.5">
                    <div className="grid grid-cols-6 gap-1.5">
                      {EMOJI_OPTIONS.map((em) => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => { onUpdate(r.id, { emoji: em }); setPickerId(null); }}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg text-[16px] cursor-pointer hover:bg-primary/15 transition-colors ${r.emoji === em ? "bg-primary/20 ring-1 ring-primary" : ""}`}
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {/* Editable title */}
              <div className="min-w-0 flex-1">
                {editingId === r.id ? (
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => { onRename(r.id, editValue); setEditingId(null); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { onRename(r.id, editValue); setEditingId(null); } }}
                    className="w-full rounded border border-border bg-card px-2 py-1 text-[13px] font-semibold text-text outline-none focus:border-primary"
                  />
                ) : (
                  <p className="text-[13px] font-semibold text-text cursor-pointer hover:text-primary" onClick={() => { setEditingId(r.id); setEditValue(r.title); }}>{r.title}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 ml-2">
              <button type="button" onClick={() => onToggle(r.id)}
                className={`toggle-track ${r.enabled ? "active" : ""}`}
              ><div className="toggle-thumb" /></button>
              {reminders.length > 1 && (
                <button type="button" onClick={() => onRemove(r.id)} className="text-[16px] text-muted cursor-pointer hover:text-danger">✕</button>
              )}
            </div>
          </div>

          {/* Row 2: time picker */}
          <div className="flex items-center gap-3">
            <label className="text-[11px] font-medium text-muted w-8">Time</label>
            <input
              type="time"
              value={r.time}
              onChange={(e) => onUpdate(r.id, { time: e.target.value })}
              className="rounded border border-border bg-card px-2 py-1 text-[13px] text-text outline-none focus:border-primary"
            />
          </div>

          {/* Row 3: day toggles */}
          <div className="flex items-center gap-3">
            <label className="text-[11px] font-medium text-muted w-8">Days</label>
            <div className="flex gap-1">
              {DAY_LABELS.map((label, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleDay(r.id, i)}
                  className={`h-7 w-7 rounded-full text-[10px] font-semibold cursor-pointer transition-colors ${
                    r.days.includes(i)
                      ? "bg-primary text-white"
                      : "bg-card text-muted border border-border"
                  } ${i === today ? "ring-1 ring-primary ring-offset-1 ring-offset-card-hover" : ""}`}
                >
                  {label[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={onAdd}
        className="w-full rounded-btn border border-dashed border-border px-4 py-3 text-[13px] font-semibold text-muted cursor-pointer hover:bg-card-hover transition-colors"
      >
        + Add reminder
      </button>
    </div>
  );
}

// ========== TRIMESTER CHECKLIST ==========
function TrimesterChecklist({ trimester, checklist, onToggle }: {
  trimester: string;
  checklist: { id: string; category: string; item: string }[];
  onToggle: (id: string) => void;
}) {
  const [done, setDone] = useState<Set<string>>(new Set());
  const categories = [...new Set(checklist.map((c) => c.category))];
  const progress = checklist.length > 0 ? done.size / checklist.length : 0;

  const handleToggle = (id: string) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      onToggle(id);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <p className="text-[13px] font-semibold text-text capitalize">{trimester} trimester checklist</p>
          <p className="text-[11px] text-muted">{done.size} / {checklist.length} done</p>
        </div>
        <div className="w-16 h-16 rounded-full bg-card flex items-center justify-center">
          <svg width="48" height="48" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="20" fill="none" stroke="var(--color-border)" strokeWidth="4" />
            <circle cx="24" cy="24" r="20" fill="none" stroke="var(--color-primary)" strokeWidth="4" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 20}`}
              strokeDashoffset={`${2 * Math.PI * 20 * (1 - progress)}`}
              transform="rotate(-90 24 24)"
              style={{ transition: "stroke-dashoffset 0.5s" }}
            />
            <text x="24" y="24" textAnchor="middle" dominantBaseline="middle" className="fill-text" style={{ fontSize: 12, fontWeight: 700 }}>{Math.round(progress * 100)}%</text>
          </svg>
        </div>
      </div>
      {categories.map((cat) => (
        <div key={cat}>
          <p className="text-[11px] font-semibold text-muted uppercase mb-1">{cat}</p>
          {checklist.filter((c) => c.category === cat).map((item) => (
            <label key={item.id} className="flex items-start gap-2 py-1.5 cursor-pointer">
              <input type="checkbox" checked={done.has(item.id)} onChange={() => handleToggle(item.id)} className="mt-0.5 accent-primary" />
              <span className={`text-[13px] ${done.has(item.id) ? "line-through text-muted" : "text-text"}`}>{item.item}</span>
            </label>
          ))}
        </div>
      ))}
    </div>
  );
}

// ========== SHIMMER SKELETON (replaces Spinner) ==========
function ShimmerSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-[120px] rounded-card bg-card-hover" />
      <div className="h-[100px] rounded-card bg-card-hover" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-[80px] rounded-btn bg-card-hover" />
        <div className="h-[80px] rounded-btn bg-card-hover" />
      </div>
      <div className="h-[200px] rounded-card bg-card-hover" />
    </div>
  );
}

// ========== YOUTUBE VIDEO EMBED CARD ==========
function VideoGuideCard({ video, onPlay }: { video: YogaVideo; onPlay: (v: YogaVideo) => void }) {
  const [showEmbed, setShowEmbed] = useState(false);

  return (
    <div className="rounded-card bg-card shadow-card overflow-hidden">
      {showEmbed ? (
        <div className="relative" style={{ paddingBottom: "56.25%" }}>
          <iframe
            src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
          <button
            type="button"
            onClick={() => setShowEmbed(false)}
            className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white text-[14px] cursor-pointer hover:bg-black/80"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowEmbed(true)}
          className="w-full p-4 text-left cursor-pointer hover:bg-card-hover transition-colors"
        >
          <div className="flex items-start gap-3">
            {/* Thumbnail placeholder */}
            <div className="flex-shrink-0 flex h-[72px] w-[96px] items-center justify-center rounded-btn bg-gradient-to-br from-primary/20 to-accent/20 text-[28px] relative overflow-hidden">
              <span>{video.thumbnail}</span>
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-text mb-0.5">{video.title}</p>
              <p className="text-[11px] text-muted line-clamp-2">{video.description}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary capitalize">{video.phase}</span>
                <span className="text-[10px] text-muted">{video.duration}</span>
              </div>
            </div>
          </div>
        </button>
      )}
    </div>
  );
}

// ========== PERIOD RELIEF STRIP ==========
function PeriodReliefStrip({ videos, onPlay }: { videos: YogaVideo[]; onPlay: (v: YogaVideo) => void }) {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  if (!videos.length) return null;

  return (
    <div>
      <SectionHeader emoji="🌸" title="Quick period relief" subtitle="5-10 minute exercises for cramps & tension" />
      <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory">
        {videos.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setActiveVideo(activeVideo === v.id ? null : v.id)}
            className="flex-shrink-0 snap-start w-[140px] rounded-btn bg-card shadow-card p-3 text-center cursor-pointer hover:scale-[1.02] transition-transform duration-150"
          >
            <div className="flex h-12 w-full items-center justify-center rounded-btn bg-gradient-to-br from-period/20 to-accent/20 text-[24px] mb-2">
              {v.thumbnail}
            </div>
            <p className="text-[12px] font-semibold text-text leading-tight">{v.title}</p>
            <p className="text-[10px] text-muted mt-0.5">{v.duration}</p>
          </button>
        ))}
      </div>

      {/* Active video embed */}
      {activeVideo && (
        <div className="rounded-card bg-card shadow-card overflow-hidden mt-2">
          <div className="flex items-center justify-between px-4 pt-3 pb-0">
            <p className="text-[12px] font-semibold text-text">{videos.find((v) => v.id === activeVideo)?.title}</p>
            <button type="button" onClick={() => setActiveVideo(null)} className="text-[12px] text-muted cursor-pointer">Close</button>
          </div>
          <div className="relative mt-2" style={{ paddingBottom: "56.25%" }}>
            <iframe
              src={`https://www.youtube.com/embed/${videos.find((v) => v.id === activeVideo)?.youtubeId}?autoplay=1&rel=0`}
              title="Video"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ========== SOUNDSCAPE CARD ==========
function SoundscapeCard({ sound, onPlay, isPlaying }: { sound: Soundscape; onPlay: () => void; isPlaying: boolean }) {
  return (
    <button
      type="button"
      onClick={onPlay}
      className={`flex-shrink-0 w-[130px] rounded-btn p-3.5 text-center cursor-pointer transition-all duration-150 ${
        isPlaying ? "bg-accent/15 ring-2 ring-accent scale-105" : "bg-card shadow-card hover:scale-[1.02]"
      }`}
    >
      <span className="text-[28px] block mb-1">{sound.emoji}</span>
      <p className={`text-[12px] font-semibold ${isPlaying ? "text-accent" : "text-text"}`}>{sound.title}</p>
      <p className="text-[9px] text-muted mt-0.5">{sound.duration}</p>
      {isPlaying && <span className="inline-block mt-1 h-1.5 w-1.5 rounded-full bg-accent animate-ping" />}
    </button>
  );
}

// ========== SOUNDSCAPE PLAYER (YouTube embed — video hidden, audio only bar) ==========
let youtubeApiLoaded = false;
const apiCallbacks: Array<() => void> = [];

function onYouTubeAPIReady() {
  youtubeApiLoaded = true;
  apiCallbacks.forEach((cb) => cb());
  apiCallbacks.length = 0;
}

function ensureYouTubeAPI() {
  if (youtubeApiLoaded) return Promise.resolve();
  return new Promise<void>((resolve) => {
    if (typeof window !== "undefined" && !document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      apiCallbacks.push(resolve);
      (window as any).onYouTubeIframeAPIReady = onYouTubeAPIReady;
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    } else if (youtubeApiLoaded) {
      resolve();
    } else {
      apiCallbacks.push(resolve);
    }
  });
}

function SoundscapePlayer({ sound, onClose }: { sound: Soundscape; onClose: () => void }) {
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [playing, setPlaying] = useState(false);
  const [apiReady, setApiReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let player: any = null;
    ensureYouTubeAPI().then(() => {
      if (!playerContainerRef.current) return;
      try {
        player = new (window as any).YT.Player(playerContainerRef.current, {
          height: "1",
          width: "1",
          videoId: sound.youtubeId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            modestbranding: 1,
            rel: 0,
            loop: 1,
            playlist: sound.youtubeId,
            iv_load_policy: 3,
            fs: 0,
          },
          events: {
            onReady: () => {
              playerRef.current = player;
              setApiReady(true);
              setPlaying(true);
            },
            onStateChange: (event: any) => {
              if (typeof (window as any).YT === "undefined") return;
              const YT = (window as any).YT;
              if (event.data === YT.PlayerState.PLAYING) setPlaying(true);
              if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) setPlaying(false);
            },
            onError: () => setError(true),
          },
        });
      } catch {
        setError(true);
      }
    });
    return () => {
      if (player && typeof player.destroy === "function") {
        try { player.destroy(); } catch { /* ignore */ }
      }
      playerRef.current = null;
    };
  }, [sound.youtubeId]);

  const togglePlay = () => {
    if (!playerRef.current) return;
    try {
      if (playing) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    } catch { /* ignore */ }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-card bg-card shadow-card border border-accent/10 overflow-hidden"
    >
      {/* 1x1 invisible YouTube player container */}
      <div ref={playerContainerRef} className="w-0 h-0 opacity-0 overflow-hidden absolute pointer-events-none" />

      {/* Audio bar UI */}
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="text-[24px] flex-shrink-0">{sound.emoji}</span>

        {/* Play/Pause button */}
        <button
          type="button"
          onClick={togglePlay}
          disabled={!apiReady || error}
          className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white cursor-pointer hover:opacity-90 transition-all disabled:opacity-40 active:scale-95"
          aria-label={playing ? "Pause" : "Play"}
        >
          {!apiReady ? (
            <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
          ) : error ? (
            <span className="text-[14px]">⚠</span>
          ) : playing ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          )}
        </button>

        {/* Title + info */}
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-text truncate">{sound.title}</p>
          <div className="flex items-center gap-2 text-[10px] text-muted">
            <span>{sound.duration}</span>
            {playing && (
              <span className="flex items-center gap-0.5">
                <span className="h-2 w-0.5 rounded-full bg-accent animate-pulse" style={{ animationDelay: "0ms" }} />
                <span className="h-3 w-0.5 rounded-full bg-accent animate-pulse" style={{ animationDelay: "200ms" }} />
                <span className="h-1.5 w-0.5 rounded-full bg-accent animate-pulse" style={{ animationDelay: "400ms" }} />
              </span>
            )}
          </div>
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="flex-shrink-0 text-muted cursor-pointer hover:text-text transition-colors p-1"
          aria-label="Close"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}

// ========== DAILY AFFIRMATION CARD ==========
function DailyAffirmationCard() {
  const affirmation = getDailyAffirmation();
  return (
    <div className="rounded-card bg-gradient-to-r from-primary/8 to-accent/8 shadow-card p-4 border border-primary/5">
      <div className="flex items-start gap-3">
        <span className="text-[22px] mt-0.5">💛</span>
        <div>
          <p className="text-[10px] font-semibold text-muted uppercase tracking-wider">Today's affirmation</p>
          <p className="text-[14px] font-medium text-text leading-relaxed mt-0.5">&ldquo;{affirmation}&rdquo;</p>
        </div>
      </div>
      <div className="flex justify-end mt-1">
        <span className="text-[9px] text-subtle">Daily · refreshes tomorrow</span>
      </div>
    </div>
  );
}

// ========== SOUNDSCAPES STRIP ==========
function SoundscapesStrip({ onPlay, activeId }: { onPlay: (s: Soundscape) => void; activeId: string | null }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[18px]">🎵</span>
          <p className="text-[14px] font-semibold text-text">Soundscapes</p>
        </div>
        <span className="text-[10px] text-muted">Ambient audio for calm & focus</span>
      </div>
      <div className="flex gap-2.5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-1">
        {SOUNDSCAPES.map((s) => (
          <SoundscapeCard
            key={s.id}
            sound={s}
            isPlaying={activeId === s.id}
            onPlay={() => onPlay(s)}
          />
        ))}
      </div>
    </div>
  );
}

type SelfcareTab = "today" | "library" | "breathing" | "meditation" | "yoga" | "sleep" | "nutrition" | "reminders" | "progress" | "trimester";

const SELF_CARE_TABS: { key: SelfcareTab; label: string; emoji: string }[] = [
  { key: "today", label: "Today", emoji: "🌿" },
  { key: "library", label: "Articles", emoji: "📖" },
  { key: "breathing", label: "Breathing", emoji: "🌬️" },
  { key: "meditation", label: "Meditation", emoji: "🧘" },
  { key: "yoga", label: "Yoga", emoji: "🤸" },
  { key: "sleep", label: "Sleep", emoji: "🌙" },
  { key: "nutrition", label: "Nutrition", emoji: "🥗" },
  { key: "reminders", label: "Reminders", emoji: "⏰" },
  { key: "progress", label: "Progress", emoji: "📊" },
];

export function Selfcare() {
  const { selfcareMap, selfcareSummary, fetchSelfcare, fetchSummary, logSelfcare, loading } = useSelfcare();
  const { trends, fetchTrends } = useVitals();
  const cycles = useCycleStore((s) => s.cycles);
  const currentPhase = useCycleStore((s) => s.currentPhase);
  const dayOfCycle = useCycleStore((s) => s.dayOfCycle);
  const [tab, setTab] = useState<SelfcareTab>("today");
  const [activePlayer, setActivePlayer] = useState<{ type: string; data: unknown } | null>(null);
  const [logSheetOpen, setLogSheetOpen] = useState(false);
  const [logField, setLogField] = useState<string>("");
  const [logValue, setLogValue] = useState<number>(3);
  const [logNotes, setLogNotes] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [reminders, setReminders] = useState<SelfCareReminder[]>(() => {
    try {
      const saved = localStorage.getItem("atnasya-reminders");
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return [
      { id: "r1", type: "hydration", title: "Drink water", time: "09:00", emoji: "💧", days: [0,1,2,3,4,5,6], enabled: true },
      { id: "r2", type: "stretch", title: "Stretch break", time: "14:00", emoji: "🤸", days: [0,1,2,3,4,5], enabled: false },
    ];
  });
  const [videoPhaseFilter, setVideoPhaseFilter] = useState<string>("all");
  const [showAllVideos, setShowAllVideos] = useState(false);
  const [activeSoundscape, setActiveSoundscape] = useState<string | null>(null);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | "unavailable">(
    typeof Notification !== "undefined" ? Notification.permission : "unavailable"
  );
  const [dailyScheduleOn, setDailyScheduleOn] = useState(() => localStorage.getItem("atnasya-daily-schedule") !== "off");
  const firedToday = useRef<Set<string>>(new Set());

  useEffect(() => {
    fetchSelfcare();
    fetchSummary();
    fetchTrends(30);
  }, [fetchSelfcare, fetchSummary, fetchTrends]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }, []);

  const selfcareCards = Array.from(selfcareMap.values()).map(selfcareCardToInsightCard);

  const handleQuickLog = (field: string) => {
    setLogField(field);
    setLogValue(field === "water" ? 3 : field === "sleep" ? 7 : 3);
    setLogNotes("");
    setLogSheetOpen(true);
  };

  const handleSaveLog = async () => {
    const today = new Date().toISOString().slice(0, 10);
    const payload: { date: string; mood?: number; water?: number; sleep?: number; energy?: number; notes?: string } = { date: today };
    if (logField === "mood") payload.mood = logValue;
    if (logField === "water") payload.water = logValue;
    if (logField === "sleep") payload.sleep = logValue;
    if (logField === "energy") payload.energy = logValue;
    if (logNotes) payload.notes = logNotes;
    await logSelfcare(payload.date, payload.mood, payload.water, payload.sleep, payload.energy, payload.notes);
    showToast(`${logField.charAt(0).toUpperCase() + logField.slice(1)} logged ✓`);
    setLogSheetOpen(false);
  };

  const handleBreathingStart = (e: GuidedBreathing) => setActivePlayer({ type: "breathing", data: e });
  const handleMeditationStart = (m: Meditation) => setActivePlayer({ type: "meditation", data: m });
  const handleYogaStart = (y: YogaRoutine) => setActivePlayer({ type: "yoga", data: y });
  const handleSleepStart = (s: SleepStory) => setActivePlayer({ type: "sleep", data: s });

  const handleSoundscapePlay = (s: Soundscape) => {
    setActiveSoundscape(activeSoundscape === s.id ? null : s.id);
  };

  const handleAddReminder = () => {
    const newReminder: SelfCareReminder = {
      id: `r${Date.now()}`,
      type: "custom",
      title: "New reminder",
      time: "12:00",
      emoji: "🔔",
      days: [0,1,2,3,4,5,6],
      enabled: true,
    };
    setReminders((prev) => [...prev, newReminder]);
    showToast("Reminder added");
  };

  const handleUpdateReminder = (id: string, updates: Partial<SelfCareReminder>) => {
    setReminders((prev) => prev.map((r) => r.id === id ? { ...r, ...updates } : r));
  };

  const handleToggleReminder = (id: string) => {
    setReminders((prev) => prev.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const handleRemoveReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const handleRenameReminder = (id: string, title: string) => {
    setReminders((prev) => prev.map((r) => r.id === id ? { ...r, title } : r));
  };

  // Daily preset schedule — fires once per day at each slot
  const DAILY_SCHEDULE = [
    { id: "morning", time: "08:00", emoji: "🌅", title: "🌅 Morning affirmation", getBody: () => getDailyAffirmation() },
    { id: "midday",   time: "12:00", emoji: "💡", title: "💡 Midday wellness tip", getBody: () => getPhaseTip(currentPhase)?.tip ?? "Take a moment to breathe and reset." },
    { id: "meditation", time: "16:00", emoji: "🧘", title: "🧘 Meditation time", getBody: () => {
      const m = MEDITATIONS[Math.floor(Math.random() * MEDITATIONS.length)];
      return `${m.title} — ${m.duration} min ${m.description}`;
    }},
    { id: "yoga", time: "18:00", emoji: "🤸", title: "🤸 Yoga break", getBody: () => {
      const y = YOGA_ROUTINES[Math.floor(Math.random() * YOGA_ROUTINES.length)];
      return `${y.title} — ${y.duration} min, ${y.poses.length} poses`;
    }},
  ];

  // Persist reminders and daily schedule toggle
  useEffect(() => {
    localStorage.setItem("atnasya-reminders", JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem("atnasya-daily-schedule", dailyScheduleOn ? "on" : "off");
  }, [dailyScheduleOn]);

  // Reset fired-today tracker when the date changes
  useEffect(() => {
    const checkDate = () => {
      firedToday.current = new Set();
    };
    // Check every minute if the date rolled over
    const dateInterval = setInterval(checkDate, 60000);
    return () => clearInterval(dateInterval);
  }, []);

  // Notification checker — runs every 30s:
  //  1. Fires browser notifications for enabled custom reminders at their scheduled time
  //  2. Fires once-per-day preset schedule notifications
  useEffect(() => {
    if (typeof Notification === "undefined") return;
    setNotifPermission(Notification.permission);
    if (Notification.permission === "denied") return;
    if (Notification.permission === "default") Notification.requestPermission().then((p) => setNotifPermission(p));

    const check = () => {
      const now = new Date();
      const currentMin = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
      const today = now.getDay();

      // 1. Custom reminders
      for (const r of reminders) {
        if (!r.enabled || !r.days.includes(today) || r.time !== currentMin) continue;
        if (Notification.permission === "granted") {
          new Notification("Atnasya Reminder", {
            body: r.emoji + " " + r.title,
            icon: "/icons/icon.svg",
            tag: r.id,
          });
        }
      }

      // 2. Daily preset schedule
      if (dailyScheduleOn) {
        for (const slot of DAILY_SCHEDULE) {
          if (slot.time !== currentMin) continue;
          if (firedToday.current.has(slot.id)) continue;
          firedToday.current.add(slot.id);
          if (Notification.permission === "granted") {
            new Notification(slot.title, {
              body: slot.getBody(),
              icon: "/icons/icon.svg",
              tag: "schedule-" + slot.id,
            });
          }
        }
      }
    };

    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, [reminders, dailyScheduleOn, currentPhase]);

  const handleRequestNotification = async () => {
    if (typeof Notification === "undefined") return;
    const p = await Notification.requestPermission();
    setNotifPermission(p);
  };

  const tip = getPhaseTip(currentPhase);
  const nutrition = getNutritionForPhase(currentPhase || "unknown" as CyclePhase);
  const yogaSuggestion = getYogaForPhase(currentPhase || "unknown" as CyclePhase);

  // Progress summary
  const progressSummary: MonthlyWellnessProgress | null = selfcareSummary ? {
    month: new Date().toLocaleString("en-US", { month: "long", year: "numeric" }),
    totalEntries: selfcareSummary.totalEntries,
    avgMood: selfcareSummary.avgMood ?? 0,
    avgWater: selfcareSummary.avgWater ?? 0,
    avgSleep: selfcareSummary.avgSleep ?? 0,
    avgEnergy: selfcareSummary.avgEnergy ?? 0,
    streak: Math.max(selfcareSummary.moodStreak, selfcareSummary.waterStreak, selfcareSummary.sleepStreak),
    topSymptoms: [],
  } : null;

  return (
    <div className="pb-24">
      <TopBar />

      {/* Active player overlay */}
      {activePlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6" onClick={() => setActivePlayer(null)}>
          <div className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            {activePlayer.type === "breathing" && <BreathingPlayer exercise={activePlayer.data as GuidedBreathing} onClose={() => setActivePlayer(null)} />}
            {activePlayer.type === "meditation" && <MeditationPlayer meditation={activePlayer.data as Meditation} onClose={() => setActivePlayer(null)} />}
            {activePlayer.type === "yoga" && <YogaPlayer routine={activePlayer.data as YogaRoutine} onClose={() => setActivePlayer(null)} />}
            {activePlayer.type === "sleep" && <SleepStoryPlayer story={activePlayer.data as SleepStory} onClose={() => setActivePlayer(null)} />}
          </div>
        </div>
      )}

      {/* Active soundscape embed */}
      {activeSoundscape && (
        <div className="px-5 pt-2">
          <SoundscapePlayer
            sound={SOUNDSCAPES.find((s) => s.id === activeSoundscape)!}
            onClose={() => setActiveSoundscape(null)}
          />
        </div>
      )}

      {/* Log bottom sheet */}
      <BottomSheet open={logSheetOpen} onClose={() => setLogSheetOpen(false)} title={`Log ${logField}`}>
        <div className="space-y-4 pb-4">
          <p className="text-[28px] text-center">
            {logField === "mood" ? "😊" : logField === "water" ? "💧" : logField === "sleep" ? "😴" : logField === "energy" ? "⚡" : "🌿"}
          </p>
          <div className="text-center">
            <span className="text-[36px] font-bold text-text">{logValue}</span>
            <span className="text-[14px] text-muted ml-1">
              {logField === "mood" ? "/5" : logField === "water" ? "glasses" : logField === "sleep" ? "hours" : logField === "energy" ? "/5" : ""}
            </span>
          </div>
          <input
            type="range" min={1} max={logField === "water" ? 12 : 10} step={1}
            value={logValue} onChange={(e) => setLogValue(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-[11px] text-muted px-1">
            <span>Low</span>
            <span>High</span>
          </div>
          <textarea
            value={logNotes} onChange={(e) => setLogNotes(e.target.value)}
            placeholder="Add a note..."
            rows={2}
            className="w-full rounded-btn border border-border bg-card px-3 py-2.5 text-[14px] text-text outline-none focus:border-primary transition-colors"
          />
          <button
            type="button"
            onClick={handleSaveLog}
            className="w-full rounded-btn bg-primary text-white font-semibold h-[50px] cursor-pointer hover:opacity-90 transition-opacity"
          >
            Save
          </button>
        </div>
      </BottomSheet>

      <div className="px-5 pt-3 space-y-4">
        {/* Tab bar */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {SELF_CARE_TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-semibold cursor-pointer transition-colors ${
                tab === t.key ? "bg-primary text-white" : "bg-card-hover text-muted hover:bg-primary/10"
              }`}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        {/* ======= TODAY TAB ======= */}
        {tab === "today" && (
          <div className="space-y-4">
            {/* Daily tip */}
            <DailyTipCard tip={tip} />

            {/* Quick cycle status */}
            {currentPhase && dayOfCycle && (
              <div className="rounded-card bg-card shadow-card p-4 flex items-center gap-3">
                <span className="text-[28px]">
                  {currentPhase === "menstrual" ? "🌸" : currentPhase === "follicular" ? "💙" : currentPhase === "fertile" ? "🌿" : currentPhase === "ovulation" ? "✨" : "🌙"}
                </span>
                <div>
                  <p className="text-[14px] font-semibold text-text capitalize">{currentPhase} · Day {dayOfCycle}</p>
                  <p className="text-[12px] text-muted">Phase-aware wellness recommendations below</p>
                </div>
              </div>
            )}

            {/* Mood-triggered content */}
            <MoodTriggeredCard mood={selfcareSummary?.avgMood ?? null} onAction={(type, refId) => {
              if (type === "breathing") {
                const ex = BREATHING_EXERCISES.find((b) => b.id === refId);
                if (ex) handleBreathingStart(ex);
              } else if (type === "meditation") {
                const m = MEDITATIONS.find((med) => med.id === refId);
                if (m) handleMeditationStart(m);
              } else if (type === "yoga") {
                const y = YOGA_ROUTINES.find((ro) => ro.id === refId);
                if (y) handleYogaStart(y);
              }
            }} />

            {/* Quick check-in log */}
            <QuickLogSection onLog={handleQuickLog} />

            {/* Self-care entries carousel */}
            {loading ? (
              /* --- Loading: show useful quick-access cards instead of dead skeletons --- */
              <div className="space-y-4">
                {/* Mini daily tip placeholder */}
                <div className="rounded-card bg-gradient-to-br from-primary/5 to-accent/5 shadow-card p-4 border border-primary/5">
                  <div className="flex items-center gap-3">
                    <span className="text-[24px]">💡</span>
                    <div>
                      <p className="text-[12px] font-semibold text-text">Loading your daily wellness...</p>
                      <p className="text-[11px] text-muted">Your phase-aware tip will appear here</p>
                    </div>
                  </div>
                </div>

                {/* Quick links to popular content */}
                <div>
                  <p className="text-[12px] font-semibold text-muted mb-2 uppercase tracking-wide">Explore while you wait</p>
                  <div className="flex gap-2.5 overflow-x-auto no-scrollbar">
                    <button type="button" onClick={() => setTab("breathing")}
                      className="flex-shrink-0 flex flex-col items-center gap-1.5 rounded-btn bg-card shadow-card px-5 py-3.5 cursor-pointer hover:bg-card-hover transition-colors">
                      <span className="text-[24px]">🌬️</span>
                      <span className="text-[11px] font-medium text-text">Breathing</span>
                    </button>
                    <button type="button" onClick={() => setTab("meditation")}
                      className="flex-shrink-0 flex flex-col items-center gap-1.5 rounded-btn bg-card shadow-card px-5 py-3.5 cursor-pointer hover:bg-card-hover transition-colors">
                      <span className="text-[24px]">🧘</span>
                      <span className="text-[11px] font-medium text-text">Meditation</span>
                    </button>
                    <button type="button" onClick={() => setTab("yoga")}
                      className="flex-shrink-0 flex flex-col items-center gap-1.5 rounded-btn bg-card shadow-card px-5 py-3.5 cursor-pointer hover:bg-card-hover transition-colors">
                      <span className="text-[24px]">🤸</span>
                      <span className="text-[11px] font-medium text-text">Yoga</span>
                    </button>
                    <button type="button" onClick={() => setTab("sleep")}
                      className="flex-shrink-0 flex flex-col items-center gap-1.5 rounded-btn bg-card shadow-card px-5 py-3.5 cursor-pointer hover:bg-card-hover transition-colors">
                      <span className="text-[24px]">🌙</span>
                      <span className="text-[11px] font-medium text-text">Sleep</span>
                    </button>
                    <button type="button" onClick={() => setTab("nutrition")}
                      className="flex-shrink-0 flex flex-col items-center gap-1.5 rounded-btn bg-card shadow-card px-5 py-3.5 cursor-pointer hover:bg-card-hover transition-colors">
                      <span className="text-[24px]">🥗</span>
                      <span className="text-[11px] font-medium text-text">Nutrition</span>
                    </button>
                  </div>
                </div>

                {/* Period relief quick access (always useful even while loading) */}
                {currentPhase === "menstrual" && (
                  <PeriodReliefStrip videos={PERIOD_RELIEF_VIDEOS} onPlay={(v) => setActivePlayer({ type: "video", data: v })} />
                )}
              </div>
            ) : (
              <>
                <SectionHeader emoji="📋" title="Recent check-ins" />
                {selfcareCards.length > 0 ? (
                  <InsightCarousel cards={selfcareCards} />
                ) : (
                  <p className="text-[13px] text-muted text-center py-4">Start logging to see your self-care history here.</p>
                )}

                {/* Quick period relief videos — always visible during menstrual phase */}
                {currentPhase === "menstrual" && (
                  <PeriodReliefStrip videos={PERIOD_RELIEF_VIDEOS} onPlay={(v) => setActivePlayer({ type: "video", data: v })} />
                )}

                {/* Phase-specific suggestions */}
                {nutrition && <NutritionCard suggestion={nutrition} />}
                {yogaSuggestion && (
                  <button
                    type="button"
                    onClick={() => handleYogaStart(yogaSuggestion)}
                    className="w-full text-left"
                  >
                    <div className="rounded-card bg-card shadow-card p-4 flex items-center gap-3 border border-accent/10">
                      <YogaIcon className="h-8 w-8 text-accent" />
                      <div>
                        <p className="text-[13px] font-semibold text-text">Try: {yogaSuggestion.title}</p>
                        <p className="text-[11px] text-muted">{yogaSuggestion.duration} min · {yogaSuggestion.poses.length} poses</p>
                      </div>
                    </div>
                  </button>
                )}

                {/* Vitals trends */}
                {trends.length > 0 && (
                  <>
                    <SectionHeader emoji="💗" title="Vitals trends" />
                    <VitalChart data={trends} />
                  </>
                )}
              </>
            )}

            {/* Soundscapes — always visible, outside loading conditional */}
            <SoundscapesStrip onPlay={handleSoundscapePlay} activeId={activeSoundscape} />
            <DailyAffirmationCard />
          </div>
        )}

        {/* ======= ARTICLE LIBRARY ======= */}
        {tab === "library" && (
          <div className="space-y-3">
            <SectionHeader emoji="📖" title="Wellness library" subtitle="Nutrition, exercise, myths & more" />
            <ArticleLibrary articles={WELLNESS_ARTICLES} />
          </div>
        )}

        {/* ======= BREATHING ======= */}
        {tab === "breathing" && (
          <div className="space-y-3">
            <SectionHeader emoji="🌬️" title="Guided breathing" subtitle="Calm your mind, one breath at a time" />
            <div className="space-y-2.5">
              {BREATHING_EXERCISES.map((ex) => (
                <button key={ex.id} type="button" onClick={() => handleBreathingStart(ex)}
                  className="w-full rounded-btn bg-card shadow-card p-4 text-left cursor-pointer hover:bg-card-hover transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: ex.color + "22" }}>
                      <BreathingIcon className="h-6 w-6" style={{ color: ex.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-text">{ex.name}</p>
                      <p className="text-[12px] text-muted">{ex.pattern} · {ex.cycles} cycles</p>
                    </div>
                    <span className="flex-shrink-0 text-[11px] font-semibold text-muted">{Math.round((ex.inhale + ex.exhale + (ex.hold || 0) * 2) * ex.cycles / 60)} min</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ======= MEDITATION ======= */}
        {tab === "meditation" && (
          <div className="space-y-3">
            <LibraryHeader
              image="/illustrations/meditations/meditation-hero.jpg"
              fallbackIcon={<MeditationIcon className="h-10 w-10 text-indigo-500" />}
              title="Meditation library"
              subtitle="Phase-specific and general sessions"
            />
            <div className="grid grid-cols-2 gap-2.5">
              {MEDITATIONS.map((m) => (
                <MeditationCard key={m.id} item={m} onStart={handleMeditationStart} />
              ))}
            </div>
          </div>
        )}

        {/* ======= YOGA ======= */}
        {tab === "yoga" && (
          <div className="space-y-4">
            <SectionHeader emoji="🤸" title="Yoga & stretching" subtitle="By cycle phase or trimester" />

            {/* Video guides section */}
            <div className="rounded-card bg-gradient-to-br from-accent/5 to-primary/5 shadow-card p-4 border border-accent/10">
              <div className="flex items-center gap-2 mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
                <span className="text-[14px] font-semibold text-text">Video guides</span>
                <span className="text-[10px] text-muted ml-auto">{ALL_YOGA_VIDEOS.length} videos</span>
              </div>

              {/* Filter by phase */}
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar mb-3">
                {["all", "menstrual", "follicular", "fertile", "ovulation", "luteal", "pregnancy", "postpartum"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => { setVideoPhaseFilter(p); setShowAllVideos(false); }}
                    className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize cursor-pointer transition-colors ${
                      videoPhaseFilter === p ? "bg-accent/20 text-accent" : "bg-card-hover text-muted hover:bg-card"
                    }`}
                  >
                    {p === "all" ? "All" : p}
                  </button>
                ))}
              </div>

              <div className="space-y-2.5">
                {(() => {
                  const filtered = videoPhaseFilter === "all"
                    ? ALL_YOGA_VIDEOS
                    : ALL_YOGA_VIDEOS.filter((v) => v.phase === videoPhaseFilter);
                  const displayed = showAllVideos ? filtered : filtered.slice(0, 4);
                  return (
                    <>
                      {displayed.length === 0 ? (
                        <p className="text-[13px] text-muted text-center py-3">No videos for this phase yet.</p>
                      ) : (
                        displayed.map((v) => (
                          <VideoGuideCard key={v.id} video={v} onPlay={(vid) => setActivePlayer({ type: "video", data: vid })} />
                        ))
                      )}
                      {filtered.length > 4 && (
                        <button
                          type="button"
                          onClick={() => setShowAllVideos(!showAllVideos)}
                          className="w-full text-center text-[12px] font-semibold text-accent cursor-pointer hover:underline py-1"
                        >
                          {showAllVideos ? "Show fewer ↑" : `Show all ${filtered.length} videos →`}
                        </button>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Pose-by-pose routines */}
            <LibraryHeader
              image="/illustrations/yoga/yoga-hero.jpg"
              fallbackIcon={<YogaIcon className="h-10 w-10 text-indigo-500" />}
              title="Pose routines"
              subtitle="Follow along step by step"
            />
            <div className="space-y-2.5">
              {YOGA_ROUTINES.map((y) => (
                <YogaCard key={y.id} routine={y} onStart={handleYogaStart} />
              ))}
            </div>
          </div>
        )}

        {/* ======= SLEEP ======= */}
        {tab === "sleep" && (
          <div className="space-y-3">
            <SectionHeader emoji="🌙" title="Sleep stories" subtitle="Wind down with calming audio" />
            <div className="space-y-2.5">
              {SLEEP_STORIES.map((s) => (
                <SleepStoryCard key={s.id} story={s} onPlay={handleSleepStart} />
              ))}
            </div>
          </div>
        )}

        {/* ======= NUTRITION ======= */}
        {tab === "nutrition" && (
          <div className="space-y-3">
            <SectionHeader emoji="🥗" title="Personalized nutrition" subtitle="Phase-specific food suggestions" />
            <div className="space-y-2.5">
              {NUTRITION_SUGGESTIONS.map((n) => (
                <NutritionCard key={n.id} suggestion={n} />
              ))}
            </div>
          </div>
        )}

        {/* ======= REMINDERS ======= */}
        {tab === "reminders" && (
          <div className="space-y-3">
            <SectionHeader emoji="⏰" title="Custom reminders" subtitle="Hydration, meds, stretch breaks" />
            {/* Notification permission status */}
            <div className="flex items-center justify-between rounded-btn bg-card-hover px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="text-[16px]">🔔</span>
                <div>
                  <p className="text-[12px] font-semibold text-text">Browser notifications</p>
                  <p className="text-[10px] text-muted">
                    {notifPermission === "granted" && "✅ Enabled — reminders will notify you"}
                    {notifPermission === "denied" && "❌ Blocked — allow notifications in browser settings"}
                    {notifPermission === "default" && "⏸️ Not requested yet"}
                    {notifPermission === "unavailable" && "⚠️ Not supported on this browser"}
                  </p>
                </div>
              </div>
              {notifPermission === "default" && (
                <button
                  type="button"
                  onClick={handleRequestNotification}
                  className="rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold text-white cursor-pointer hover:opacity-90"
                >
                  Enable
                </button>
              )}
              {notifPermission === "denied" && (
                <span className="text-[10px] text-muted italic">Settings</span>
              )}
            </div>
            {/* Daily schedule toggle */}
            <div className="flex items-center justify-between rounded-btn bg-card-hover px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="text-[16px]">📅</span>
                <div>
                  <p className="text-[12px] font-semibold text-text">Daily wellness schedule</p>
                  <p className="text-[10px] text-muted">
                    {dailyScheduleOn
                      ? "🌅 8AM · 💡 12PM · 🧘 4PM · 🤸 6PM"
                      : "Turn on for daily affirmations, tips, & reminders"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDailyScheduleOn((p) => !p)}
                className={`toggle-track ${dailyScheduleOn ? "active" : ""}`}
              ><div className="toggle-thumb" /></button>
            </div>
            <ReminderScheduler
              reminders={reminders}
              onAdd={handleAddReminder}
              onToggle={handleToggleReminder}
              onRemove={handleRemoveReminder}
              onRename={handleRenameReminder}
              onUpdate={handleUpdateReminder}
            />
          </div>
        )}

        {/* ======= PROGRESS ======= */}
        {tab === "progress" && (
          <div className="space-y-3">
            <SectionHeader emoji="📊" title="Monthly progress" subtitle="Your self-care summary" />

            {progressSummary ? (
              <div className="rounded-card bg-card shadow-card p-5 space-y-4">
                <p className="text-[13px] font-semibold text-text">{progressSummary.month}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 rounded-btn bg-card-hover">
                    <p className="text-[24px] font-bold text-text">{progressSummary.avgMood.toFixed(1)}</p>
                    <p className="text-[11px] text-muted">Avg mood</p>
                  </div>
                  <div className="text-center p-3 rounded-btn bg-card-hover">
                    <p className="text-[24px] font-bold text-text">{progressSummary.totalEntries}</p>
                    <p className="text-[11px] text-muted">Check-ins</p>
                  </div>
                  <div className="text-center p-3 rounded-btn bg-card-hover">
                    <p className="text-[24px] font-bold text-text">{progressSummary.avgWater.toFixed(0)}</p>
                    <p className="text-[11px] text-muted">Avg water</p>
                  </div>
                  <div className="text-center p-3 rounded-btn bg-card-hover">
                    <p className="text-[24px] font-bold text-text">{progressSummary.avgSleep.toFixed(0)}h</p>
                    <p className="text-[11px] text-muted">Avg sleep</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-muted">Streak</span>
                  <span className="text-[16px] font-bold text-text">{progressSummary.streak}d 🔥</span>
                </div>
              </div>
            ) : (
              <div className="rounded-card bg-card shadow-card p-6 text-center">
                <p className="text-[14px] text-muted">Log more self-care entries to see your monthly progress.</p>
              </div>
            )}

            {/* Downloadable report placeholder */}
            <button
              type="button"
              onClick={() => showToast("PDF report coming soon")}
              className="w-full rounded-btn border-2 border-dashed border-border px-5 py-4 text-[14px] font-semibold text-muted cursor-pointer hover:bg-card-hover transition-colors"
            >
              📄 Download wellness report (PDF)
            </button>

            {/* Partner-shareable summary */}
            <button
              type="button"
              onClick={() => showToast("Share with partner coming soon")}
              className="w-full rounded-btn border-2 border-primary/30 px-5 py-4 text-[14px] font-semibold text-primary cursor-pointer hover:bg-primary/5 transition-colors"
            >
              🤝 Share summary with partner
            </button>
          </div>
        )}

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
