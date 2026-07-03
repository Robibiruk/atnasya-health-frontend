// StepPregnancy — Step 6: Are you currently pregnant? (conditional)
import { OptionCard } from "./OptionCard";

interface StepPregnancyProps {
  pregnant: boolean | null;
  onSelect: (val: boolean | null) => void;
  onNext: () => void;
}

const OPTIONS = [
  { id: false as boolean | null, icon: "✋", label: "No", subtitle: "Not currently pregnant" },
  { id: true as boolean | null, icon: "🤰", label: "Yes", subtitle: "I'm currently pregnant" },
  { id: null as boolean | null, icon: "🤔", label: "Not sure", subtitle: "I don't know yet" },
];

export function StepPregnancy({ pregnant, onSelect, onNext }: StepPregnancyProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-bold text-text" style={{ fontFamily: "DM Serif Display, serif" }}>
          Are you currently pregnant?
        </h1>
        <p className="mt-2 text-[14px] text-muted">
          This helps us tailor your experience
        </p>
      </div>

      <div className="space-y-3">
        {OPTIONS.map((opt) => (
          <OptionCard
            key={String(opt.id)}
            icon={opt.icon}
            label={opt.label}
            subtitle={opt.subtitle}
            selected={pregnant === opt.id}
            onClick={() => onSelect(opt.id)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={pregnant === undefined}
        className="w-full rounded-btn bg-primary px-5 py-3.5 text-[15px] font-semibold text-white cursor-pointer transition-colors duration-200 hover:bg-primary-light disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continue
      </button>
    </div>
  );
}
