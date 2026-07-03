// StepRole — Step 0: How will you use Atnasya?
import { motion } from "framer-motion";

interface StepRoleProps {
  selected: "tracker" | "partner" | null;
  onSelect: (role: "tracker" | "partner") => void;
  onNext: () => void;
}

export function StepRole({ selected, onSelect, onNext }: StepRoleProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-[28px] font-bold text-text"
          style={{ fontFamily: "DM Serif Display, serif" }}
        >
          Welcome to Atnasya
        </h1>
        <p className="mt-2 text-[15px] text-muted">
          Tell us how you&apos;ll be using the app
        </p>
      </div>

      <div className="space-y-4">
        {/* Tracker card */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect("tracker")}
          className={`
            flex w-full items-center gap-4 rounded-card border-2 p-5 text-left cursor-pointer
            transition-all duration-150 min-h-[100px]
            ${selected === "tracker"
              ? "border-primary bg-card-hover"
              : "border-border bg-card hover:bg-card-hover"
            }
          `}
        >
          {/* Flower icon */}
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 16.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 1 1 4.5 4.5 4.5 4.5 0 1 1-4.5 4.5" />
              <path d="M12 7.5V9M16.5 12H15M12 16.5V15M7.5 12H9" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[16px] font-bold text-text">Track my cycle</p>
            <p className="text-[13px] text-muted">Log periods, symptoms, moods and get insights</p>
          </div>
          {selected === "tracker" && (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          )}
        </motion.button>

        {/* Partner card */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect("partner")}
          className={`
            flex w-full items-center gap-4 rounded-card border-2 p-5 text-left cursor-pointer
            transition-all duration-150 min-h-[100px]
            ${selected === "partner"
              ? "border-primary bg-card-hover"
              : "border-border bg-card hover:bg-card-hover"
            }
          `}
        >
          {/* Heart-hand icon */}
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[16px] font-bold text-text">Support my partner</p>
            <p className="text-[13px] text-muted">See your partner&apos;s cycle phase and how to support them</p>
          </div>
          {selected === "partner" && (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          )}
        </motion.button>
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!selected}
        className="w-full rounded-btn bg-primary px-5 py-4 text-[15px] font-semibold text-white cursor-pointer transition-all duration-200 hover:bg-primary-light disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continue
      </button>
    </div>
  );
}
