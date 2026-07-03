// StepBirthYear — Step 5: What year were you born?

interface StepBirthYearProps {
  birthYear: number | null;
  onChange: (year: number) => void;
  onNext: () => void;
}

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = CURRENT_YEAR - 80;
const MAX_YEAR = CURRENT_YEAR - 12;
const DEFAULT_YEAR = Math.min(CURRENT_YEAR - 25, MAX_YEAR);

export function StepBirthYear({ birthYear, onChange, onNext }: StepBirthYearProps) {
  const year = birthYear ?? DEFAULT_YEAR;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-bold text-text" style={{ fontFamily: "DM Serif Display, serif" }}>
          What year were you born?
        </h1>
        <p className="mt-2 text-[14px] text-muted">
          Helps us give age-appropriate insights
        </p>
      </div>

      <div className="flex items-center justify-center">
        <input
          type="number"
          value={year}
          min={MIN_YEAR}
          max={MAX_YEAR}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (!isNaN(v) && v >= MIN_YEAR && v <= MAX_YEAR) onChange(v);
          }}
          className="w-40 rounded-btn border border-border bg-card px-4 py-4 text-center text-[32px] font-bold text-primary outline-none focus:border-primary transition-colors duration-150 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>

      <p className="text-center text-[13px] text-muted">
        Range: {MIN_YEAR} – {MAX_YEAR}
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
