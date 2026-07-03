// PredictionCard — "Period in X days" + upcoming event pills + quick stats.
import { CyclePrediction } from "../../types";
import { daysUntil } from "../../lib/cycleUtils";

interface PredictionCardProps {
  prediction: CyclePrediction | null;
}

export function PredictionCard({ prediction }: PredictionCardProps) {
  if (!prediction) {
    return (
      <div className="rounded-card bg-card shadow-card p-5 text-center">
        <p className="text-sm text-muted">
          Log at least 2 cycles to see your prediction
        </p>
      </div>
    );
  }

  const days = daysUntil(prediction.nextPeriod);
  const fertileDays = daysUntil(prediction.fertileStart);

  const pills = [
    { label: days > 0 ? `Period in ${days}d` : days === 0 ? "Period today" : `Period ${-days}d ago`, tint: "bg-period-tint", text: "text-period" },
    { label: fertileDays > 0 ? `Fertile in ${fertileDays}d` : "Fertile now", tint: "bg-fertile-tint", text: "text-fertile" },
    { label: `PMS in ${Math.max(1, 21 - (dayOfCycle(prediction) - 1))}d`, tint: "bg-pms-tint", text: "text-pms" },
  ];

  return (
    <div className="space-y-4">
      {/* Countdown */}
      <div className="rounded-card bg-card shadow-card p-5 text-center">
        {days > 0 ? (
          <>
            <p className="text-[42px] font-bold text-primary leading-none">{days}</p>
            <p className="text-sm text-muted mt-1">
              {days === 1 ? "day until your period" : "days until your period"}
            </p>
          </>
        ) : days === 0 ? (
          <p className="text-xl font-semibold text-accent">Your period may start today</p>
        ) : (
          <p className="text-sm text-muted">
            Period was due {-days} day{-days === 1 ? "" : "s"} ago
          </p>
        )}
      </div>

      {/* Event pills */}
      <div className="flex gap-2 justify-center flex-wrap">
        {pills.map((p) => (
          <span
            key={p.label}
            className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-[12px] font-semibold ${p.tint} ${p.text}`}
          >
            {p.label}
          </span>
        ))}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-card bg-card shadow-card p-4">
          <p className="text-[12px] text-muted">Cycle length</p>
          <p className="text-[22px] font-bold text-primary">{prediction.avgLength} days</p>
        </div>
        <div className="rounded-card bg-card shadow-card p-4">
          <p className="text-[12px] text-muted">Period</p>
          <p className="text-[22px] font-bold text-primary">5 days</p>
        </div>
      </div>
    </div>
  );
}

function dayOfCycle(pred: CyclePrediction): number {
  const last = new Date(pred.nextPeriod);
  last.setDate(last.getDate() - pred.avgLength);
  const today = new Date();
  return Math.floor((today.getTime() - last.getTime()) / 86400000) + 1;
}
