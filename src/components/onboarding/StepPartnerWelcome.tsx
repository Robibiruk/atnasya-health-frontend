// StepPartnerWelcome — Partner onboarding step 1: name confirmation
interface StepPartnerWelcomeProps {
  name: string;
  onChange: (name: string) => void;
  onNext: () => void;
}

export function StepPartnerWelcome({ name, onChange, onNext }: StepPartnerWelcomeProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-[24px] font-bold text-text"
          style={{ fontFamily: "DM Serif Display, serif" }}
        >
          What should we call you?
        </h1>
        <p className="mt-2 text-[14px] text-muted">
          Your partner will see this name
        </p>
      </div>

      <input
        type="text"
        placeholder="Your first name"
        value={name}
        onChange={(e) => onChange(e.target.value)}
        autoFocus
        className="w-full rounded-btn border border-border bg-card px-4 py-4 text-[16px] text-text outline-none focus:border-primary transition-colors duration-150"
      />

      <button
        type="button"
        onClick={onNext}
        disabled={!name.trim()}
        className="w-full rounded-btn bg-primary px-5 py-4 text-[15px] font-semibold text-white cursor-pointer transition-all duration-200 hover:bg-primary-light disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continue
      </button>
    </div>
  );
}
