// EmpathyTipCard — displays the AI-generated empathy tip.
interface EmpathyTipCardProps {
  tip: string;
}

export function EmpathyTipCard({ tip }: EmpathyTipCardProps) {
  return (
    <div
      className="rounded-[20px] p-5 space-y-3"
      style={{
        background: "linear-gradient(135deg, rgba(123,79,158,0.08), rgba(232,121,160,0.08))",
        border: "1px solid rgba(123,79,158,0.2)",
      }}
    >
      <div className="flex items-center gap-2">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <span className="text-[12px] font-semibold uppercase tracking-wider text-muted">
          How to support her today
        </span>
      </div>
      <p className="text-[15px] text-text leading-relaxed">
        {tip}
      </p>
    </div>
  );
}
