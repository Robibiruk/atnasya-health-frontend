// StepCycleLength — Step 4: How long is your cycle usually?
import { motion } from "framer-motion";

interface StepCycleLengthProps {
  cycleLength: number;
  onChange: (len: number) => void;
  onNext: () => void;
}

const MIN = 21;
const MAX = 45;

export function StepCycleLength({ cycleLength, onChange, onNext }: StepCycleLengthProps) {
  const dec = () => onChange(Math.max(MIN, cycleLength - 1));
  const inc = () => onChange(Math.min(MAX, cycleLength + 1));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-bold text-text" style={{ fontFamily: "DM Serif Display, serif" }}>
          How long is your cycle usually?
        </h1>
        <p className="mt-2 text-[14px] text-muted">
          Day 1 of period to day 1 of next period. Most people: 21–35 days
        </p>
      </div>

      <div className="flex items-center justify-center gap-6">
        <motion.button
          type="button"
          onClick={dec}
          whileTap={{ scale: 0.9 }}
          disabled={cycleLength <= MIN}
          className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-card cursor-pointer transition-colors duration-150 hover:bg-card-hover disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Decrease cycle length"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </motion.button>

        <div className="flex flex-col items-center">
          <span className="text-[56px] font-bold text-primary leading-none">
            {cycleLength}
          </span>
          <span className="mt-1 text-[13px] text-muted">days</span>
        </div>

        <motion.button
          type="button"
          onClick={inc}
          whileTap={{ scale: 0.9 }}
          disabled={cycleLength >= MAX}
          className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-card cursor-pointer transition-colors duration-150 hover:bg-card-hover disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Increase cycle length"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </motion.button>
      </div>

      <p className="text-center text-[13px] text-muted">
        Average cycle length is 28 days
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
