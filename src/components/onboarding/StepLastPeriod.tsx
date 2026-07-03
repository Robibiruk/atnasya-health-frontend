// StepLastPeriod — Step 2: When did your last period start?
import { useState } from "react";

interface StepLastPeriodProps {
  periodStart: string | null;
  onSelect: (date: string | null) => void;
  onNext: () => void;
}

export function StepLastPeriod({ periodStart, onSelect, onNext }: StepLastPeriodProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [showUnsure, setShowUnsure] = useState(periodStart === null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-bold text-text" style={{ fontFamily: "DM Serif Display, serif" }}>
          When did your last period start?
        </h1>
        <p className="mt-2 text-[14px] text-muted">
          Estimate is fine — we&apos;ll refine it over time
        </p>
      </div>

      {!showUnsure ? (
        <div className="space-y-4">
          <input
            type="date"
            value={periodStart ?? today}
            max={today}
            onChange={(e) => onSelect(e.target.value)}
            className="w-full rounded-btn border border-border bg-card px-4 py-3.5 text-[15px] text-text outline-none focus:border-primary transition-colors duration-150"
          />
          <button
            type="button"
            onClick={() => {
              setShowUnsure(true);
              onSelect(null);
            }}
            className="w-full text-center text-[13px] text-muted underline cursor-pointer"
          >
            I&apos;m not sure
          </button>
        </div>
      ) : (
        <div className="space-y-4 rounded-card border border-border bg-card p-6 text-center">
          <p className="text-[15px] text-text">
            No problem — you can log your period later.
          </p>
          <button
            type="button"
            onClick={() => {
              setShowUnsure(false);
              onSelect(today);
            }}
            className="text-[13px] text-primary font-semibold underline cursor-pointer"
          >
            Actually, I do know
          </button>
        </div>
      )}

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
