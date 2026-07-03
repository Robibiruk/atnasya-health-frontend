// CycleCalendar — monthly grid with phase-colored cells, staggered dayPop, selection.
import { useState, useEffect } from "react";
import type { CyclePhase } from "../../types";
import { phaseColor } from "../../lib/cycleUtils";

interface CycleCalendarProps {
  year: number;
  month: number; // 1-12
  days: Array<{ date: string; phase: CyclePhase }>;
  onSelectDay?: (date: string) => void;
  onChangeMonth?: (year: number, month: number) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function daysInMonth(y: number, m: number): number {
  return new Date(y, m, 0).getDate();
}

function startOffset(y: number, m: number): number {
  return new Date(y, m - 1, 1).getDay(); // 0=Sun
}

function phaseClasses(phase: CyclePhase): { bg: string; text: string } {
  switch (phase) {
    case "menstrual":
      return { bg: "bg-period", text: "text-white" };
    case "follicular":
      return { bg: "bg-follicular-tint", text: "text-follicular" };
    case "fertile":
      return { bg: "bg-fertile-tint", text: "text-fertile" };
    case "ovulation":
      return { bg: "bg-ovulation", text: "text-white" };
    case "luteal":
      return { bg: "bg-pms-tint", text: "text-pms" };
    default:
      return { bg: "bg-transparent", text: "text-text" };
  }
}

export function CycleCalendar({
  year,
  month,
  days,
  onSelectDay,
  onChangeMonth,
}: CycleCalendarProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(false);
    const t = setTimeout(() => setAnimate(true), 50);
    return () => clearTimeout(t);
  }, [year, month]);

  const total = daysInMonth(year, month);
  const offset = startOffset(year, month);
  const todayStr = new Date().toISOString().slice(0, 10);
  const phaseByDate = new Map(days.map((d) => [d.date, d.phase]));

  const goPrev = () => {
    const d = new Date(year, month - 2, 1);
    onChangeMonth?.(d.getFullYear(), d.getMonth() + 1);
  };
  const goNext = () => {
    const d = new Date(year, month, 1);
    onChangeMonth?.(d.getFullYear(), d.getMonth() + 1);
  };

  const monthName = new Date(year, month - 1, 1).toLocaleString("en-US", { month: "long" });
  const selectedDay = days.find((d) => d.date === selected);

  return (
    <div className="rounded-card bg-card shadow-card p-4">
      {/* Month header */}
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous month"
          className="flex h-8 w-8 items-center justify-center rounded-full cursor-pointer hover:bg-card-hover transition-colors duration-150"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h3 className="text-[18px] font-bold text-text">{monthName} {year}</h3>
        <button
          type="button"
          onClick={goNext}
          aria-label="Next month"
          className="flex h-8 w-8 items-center justify-center rounded-full cursor-pointer hover:bg-card-hover transition-colors duration-150"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Weekday row */}
      <div className="grid grid-cols-7 gap-1 text-center text-[12px] font-semibold text-muted mb-1">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1">{w}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {Array.from({ length: total }).map((_, i) => {
          const day = i + 1;
          const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const phase = phaseByDate.get(iso) ?? "unknown";
          const isToday = iso === todayStr;
          const isSelected = iso === selected;
          const { bg, text } = phaseClasses(phase);

          return (
            <button
              key={iso}
              type="button"
              onClick={() => {
                setSelected(iso);
                onSelectDay?.(iso);
              }}
              style={{ animationDelay: animate ? `${i * 25}ms` : "0ms" }}
              className={`
                relative flex h-9 w-full items-center justify-center rounded-full text-[14px] font-medium cursor-pointer transition-all duration-150
                ${animate ? "animate-day-pop" : "opacity-0"}
                ${bg} ${text}
                ${isToday ? "ring-2 ring-primary ring-offset-1 ring-offset-card" : ""}
                ${isSelected ? "scale-110 ring-2 ring-primary" : ""}
                ${phase === "ovulation" && isToday ? "animate-pulsering" : ""}
                hover:bg-card-hover
              `}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Selected day info strip */}
      {selectedDay && (
        <div
          className="mt-3 flex items-center gap-3 rounded-btn p-3 border-l-4"
          style={{ borderColor: phaseColor(selectedDay.phase), backgroundColor: "var(--color-card-hover)" }}
        >
          <div>
            <p className="text-[14px] font-semibold text-text">
              Day {parseInt(selectedDay.date.slice(8, 10))} · {selectedDay.phase.charAt(0).toUpperCase() + selectedDay.phase.slice(1)}
            </p>
            <p className="text-[13px] text-muted">
              {selectedDay.phase === "menstrual" && "Rest and take it easy on your body."}
              {selectedDay.phase === "fertile" && "Your most fertile window — energy is high."}
              {selectedDay.phase === "ovulation" && "Ovulation day — peak energy and focus."}
              {selectedDay.phase === "follicular" && "Rising energy — great time for new habits."}
              {selectedDay.phase === "luteal" && "Slow down and nurture yourself."}
              {selectedDay.phase === "unknown" && "Log more cycles to see phase details."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
