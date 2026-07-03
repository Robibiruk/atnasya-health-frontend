// StepDuration — Step 3: How long does your period usually last?
import { motion } from "framer-motion";

interface StepDurationProps {
  periodLength: number;
  onSelect: (days: number) => void;
  onNext: () => void;
}

const DURATIONS = [2, 3, 4, 5, 6, 7, 8];

export function StepDuration({ periodLength, onSelect, onNext }: StepDurationProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-bold text-text" style={{ fontFamily: "DM Serif Display, serif" }}>
          How long does your period usually last?
        </h1>
        <p className="mt-2 text-[14px] text-muted">
          Most people: 3–7 days
        </p>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        {DURATIONS.map((d) => {
          const selected = periodLength === d;
          return (
            <motion.button
              key={d}
              type="button"
              onClick={() => onSelect(d)}
              whileTap={{ scale: 0.92 }}
              className={`
                flex h-14 w-14 items-center justify-center rounded-full text-[16px] font-bold cursor-pointer
                transition-all duration-150
                ${
                  selected
                    ? "bg-primary text-white shadow-card"
                    : "border border-border bg-card text-text hover:bg-card-hover"
                }
              `}
            >
              {d}{d === 8 ? "+" : ""}
            </motion.button>
          );
        })}
      </div>

      <p className="text-center text-[13px] text-muted">
        Selected: <span className="font-semibold text-primary">{periodLength} days</span>
      </p>

      <button
        type="button"
        onClick={onNext}
        className="w-full rounded-btn bg-primary px-5 py-3.5 text-[15px] font-semibold text-white cursor-pointer transition-colors duration-200 hover:bg-primary-light"
      >
        Continue
      </button>
    </div>
  );
}
