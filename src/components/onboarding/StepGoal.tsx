// StepGoal — Step 1: What brings you here?
import { OptionCard } from "./OptionCard";

interface StepGoalProps {
  goal: string;
  onSelect: (goal: "track" | "conceive" | "avoid" | "wellness" | "understand") => void;
  onNext: () => void;
}

const GOALS = [
  { id: "track" as const, icon: "🩸", label: "Track my period", subtitle: "Log periods, symptoms, and flow" },
  { id: "conceive" as const, icon: "🤰", label: "Get pregnant", subtitle: "Track ovulation and fertile window" },
  { id: "avoid" as const, icon: "🚫", label: "Avoid pregnancy", subtitle: "Know your cycle to plan accordingly" },
  { id: "wellness" as const, icon: "🌿", label: "Track general health", subtitle: "Mood, vitals, energy, and more" },
  { id: "understand" as const, icon: "📊", label: "Understand my cycle", subtitle: "Learn patterns and predictions" },
];

export function StepGoal({ goal, onSelect, onNext }: StepGoalProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-bold text-text" style={{ fontFamily: "DM Serif Display, serif" }}>
          What&apos;s your goal?
        </h1>
        <p className="mt-2 text-[14px] text-muted">
          We&apos;ll personalize your experience
        </p>
      </div>

      <div className="space-y-3">
        {GOALS.map((g) => (
          <OptionCard
            key={g.id}
            icon={g.icon}
            label={g.label}
            subtitle={g.subtitle}
            selected={goal === g.id}
            onClick={() => onSelect(g.id)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!goal}
        className="w-full rounded-btn bg-primary px-5 py-3.5 text-[15px] font-semibold text-white cursor-pointer transition-colors duration-200 hover:bg-primary-light disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continue
      </button>
    </div>
  );
}
