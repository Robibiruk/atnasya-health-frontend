// PeriodLogSheet — bottom sheet with date picker + duration picker for logging periods.
import { useState } from "react";
import { BottomSheet } from "../ui/BottomSheet";

interface PeriodLogSheetProps {
  open: boolean;
  onClose: () => void;
  onSave: (startDate: string, duration: number) => Promise<void>;
  defaultDuration?: number;
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const DURATIONS = [2, 3, 4, 5, 6, 7, 8];

function daysInMonth(y: number, m: number): number {
  return new Date(y, m, 0).getDate();
}

function startOffset(y: number, m: number): number {
  return new Date(y, m - 1, 1).getDay();
}

export function PeriodLogSheet({
  open,
  onClose,
  onSave,
  defaultDuration = 5,
}: PeriodLogSheetProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [duration, setDuration] = useState(defaultDuration);
  const [saving, setSaving] = useState(false);

  const total = daysInMonth(year, month);
  const offset = startOffset(year, month);
  const todayIso = today.toISOString().slice(0, 10);
  const maxPast = new Date(today.getTime() - 90 * 86400000);

  const goPrevMonth = () => {
    const d = new Date(year, month - 2, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
  };
  const goNextMonth = () => {
    if (month === today.getMonth() + 1 && year === today.getFullYear()) return;
    const d = new Date(year, month, 1);
    const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    if (next <= today) {
      setYear(next.getFullYear());
      setMonth(next.getMonth() + 1);
    }
  };

  const monthName = new Date(year, month - 1, 1).toLocaleString("en-US", { month: "long" });

  const handleSave = async () => {
    if (!selectedDate) return;
    setSaving(true);
    try {
      await onSave(selectedDate, duration);
      onClose();
    } catch {
      setSaving(false);
    }
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="Log period">
      <div className="space-y-5">
        <div>
          <p className="text-[14px] text-muted mb-3">When did your period start?</p>

          {/* Mini calendar */}
          <div className="dark-stage p-4">
            {/* Month nav */}
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={goPrevMonth}
                aria-label="Previous month"
                className="flex h-8 w-8 items-center justify-center rounded-full cursor-pointer"
                style={{ color: "var(--color-muted)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              <span className="text-[13px] font-semibold" style={{ color: "var(--color-text)" }}>{monthName} {year}</span>
              <button
                type="button"
                onClick={goNextMonth}
                disabled={month === today.getMonth() + 1 && year === today.getFullYear()}
                aria-label="Next month"
                className="flex h-8 w-8 items-center justify-center rounded-full cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ color: "var(--color-muted)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            </div>

            {/* Weekday header */}
            <div className="mb-1 grid grid-cols-7 gap-0.5 text-center">
              {WEEKDAYS.map((w, i) => (
                <div
                  key={`${w}-${i}`}
                  className="py-0.5 font-mono text-[10px] tracking-[2px] uppercase"
                  style={{ color: "var(--color-muted)", opacity: 0.5 }}
                >
                  {w}
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: offset }).map((_, i) => (
                <div key={`e-${i}`} className="h-9" />
              ))}
              {Array.from({ length: total }).map((_, i) => {
                const day = i + 1;
                const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const isToday = iso === todayIso;
                const isSelected = iso === selectedDate;
                const isFuture = iso > todayIso;
                const isTooOld = new Date(iso) < maxPast;
                const disabled = isFuture || isTooOld;

                return (
                  <button
                    key={iso}
                    type="button"
                    disabled={disabled}
                    onClick={() => setSelectedDate(iso)}
                    className={`
                      flex h-9 w-full items-center justify-center rounded-full text-[13px] font-medium
                      cursor-pointer transition-all duration-100
                      ${disabled ? "opacity-20 cursor-not-allowed" : "hover:bg-[var(--color-primary)]/10"}
                      ${isSelected ? "bg-[var(--color-period)] text-white font-bold" : ""}
                      ${isToday && !isSelected ? "ring-1" : ""}
                    `}
                    style={{
                      color: disabled ? "var(--color-muted)" : "var(--color-text)",
                      border: isToday && !isSelected ? "1px solid var(--color-primary)" : undefined,
                    }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Duration picker */}
        <div>
          <p className="text-[14px] text-muted mb-3">How many days did it last?</p>
          <div className="flex flex-wrap gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDuration(d)}
                className={`
                  flex h-10 w-10 items-center justify-center rounded-full text-[14px] font-semibold
                  cursor-pointer transition-all duration-100
                  ${duration === d
                    ? "bg-[var(--color-period)] text-white"
                    : "border border-border text-muted hover:bg-card-hover"
                  }
                `}
              >
                {d}{d === 8 ? "+" : ""}
              </button>
            ))}
          </div>
        </div>

        {/* Save button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={!selectedDate || saving}
          className="w-full rounded-btn bg-[var(--color-period)] px-5 py-3.5 text-[15px] font-semibold text-white cursor-pointer transition-opacity duration-200 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save period"}
        </button>
      </div>
    </BottomSheet>
  );
}
