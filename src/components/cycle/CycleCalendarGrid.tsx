// CycleCalendarGrid — dark-stage calendar with intelligent phase coloring.
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CyclePhase } from "../../types";

interface CycleCalendarGridProps {
  phaseMap: Map<string, CyclePhase>;
  loggedDates: Set<string>;
  year: number;
  month: number; // 1-12
  selectedDate: string | null;
  onSelectDay: (date: string) => void;
  onChangeMonth: (year: number, month: number) => void;
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

// Phase colors — soft, harmonious with the plum/rose design system
function getPhaseStyle(phase: CyclePhase, isLogged: boolean): { bg: string; text: string; border: string; opacity: number } {
  const o = isLogged ? 1 : 0.5;
  switch (phase) {
    case "menstrual":
      return {
        bg: `rgba(232,121,160,${0.22 * o + 0.1})`,
        text: "var(--color-period)",
        border: `rgba(232,121,160,${0.5 * o + 0.2})`,
        opacity: 1,
      };
    case "follicular":
      return {
        bg: `rgba(96,165,250,${0.12 * o})`,
        text: `rgba(96,165,250,${0.7 * o + 0.3})`,
        border: "transparent",
        opacity: 1,
      };
    case "fertile":
      return {
        bg: `rgba(16,185,129,${0.15 * o})`,
        text: "#10B981",
        border: `rgba(16,185,129,${0.4 * o + 0.15})`,
        opacity: 1,
      };
    case "ovulation":
      return {
        bg: `rgba(245,158,11,${0.2 * o + 0.08})`,
        text: "#F59E0B",
        border: `rgba(245,158,11,${0.5 * o + 0.2})`,
        opacity: 1,
      };
    case "luteal":
      return {
        bg: `rgba(245,158,11,${0.08 * o})`,
        text: `rgba(245,158,11,${0.6 * o + 0.3})`,
        border: "transparent",
        opacity: 1,
      };
    default:
      return { bg: "transparent", text: "var(--color-muted)", border: "transparent", opacity: 0.4 };
  }
}

function daysInMonth(y: number, m: number): number {
  return new Date(y, m, 0).getDate();
}

function startOffset(y: number, m: number): number {
  return new Date(y, m - 1, 1).getDay(); // 0=Sun
}

export function CycleCalendarGrid({
  phaseMap,
  loggedDates,
  year,
  month,
  selectedDate,
  onSelectDay,
  onChangeMonth,
}: CycleCalendarGridProps) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(false);
    const t = setTimeout(() => setAnimate(true), 50);
    return () => clearTimeout(t);
  }, [year, month]);

  const total = daysInMonth(year, month);
  const offset = startOffset(year, month);
  const today = new Date().toISOString().slice(0, 10);

  const goPrev = () => {
    const d = new Date(year, month - 2, 1);
    onChangeMonth(d.getFullYear(), d.getMonth() + 1);
  };
  const goNext = () => {
    const d = new Date(year, month, 1);
    onChangeMonth(d.getFullYear(), d.getMonth() + 1);
  };

  const monthName = new Date(year, month - 1, 1).toLocaleString("en-US", { month: "long" });

  // Build day cells
  const cells: Array<{
    iso: string;
    day: number;
    phase: CyclePhase;
    isLogged: boolean;
    isToday: boolean;
    isSelected: boolean;
  }> = [];

  for (let d = 1; d <= total; d++) {
    const iso = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const phase = phaseMap.get(iso) ?? "unknown";
    cells.push({
      iso,
      day: d,
      phase,
      isLogged: loggedDates.has(iso),
      isToday: iso === today,
      isSelected: iso === selectedDate,
    });
  }

  return (
    <div className="dark-stage p-5 overflow-hidden">
      {/* Month header */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous month"
          className="flex h-11 w-11 items-center justify-center rounded-full cursor-pointer transition-colors duration-150"
          style={{ color: "var(--color-muted)" }}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h3 className="text-[16px] font-bold" style={{ color: "var(--color-text)" }}>
          {monthName} {year}
        </h3>
        <button
          type="button"
          onClick={goNext}
          aria-label="Next month"
          className="flex h-11 w-11 items-center justify-center rounded-full cursor-pointer transition-colors duration-150"
          style={{ color: "var(--color-muted)" }}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Weekday header */}
      <div className="mb-2 grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((w, i) => (
          <div
            key={`${w}-${i}`}
            className="py-1 font-mono text-[11px] tracking-[3px] uppercase"
            style={{ color: "var(--color-muted)", opacity: 0.5 }}
          >
            {w}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for offset */}
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`empty-${i}`} className="h-11 w-full" />
        ))}

        {/* Day cells */}
        {cells.map((cell, i) => {
          const style = getPhaseStyle(cell.phase, cell.isLogged);
          const isPeriod = cell.phase === "menstrual";

          // Check if next day is also period (for pill bridge)
          const nextCell = cells[i + 1];
          const hasPeriodNext = isPeriod && nextCell?.phase === "menstrual";

          return (
            <motion.button
              key={cell.iso}
              type="button"
              initial={animate ? { opacity: 0, scale: 0.7 } : { opacity: 1, scale: 1 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: i * 0.012, ease: "easeOut" }}
              onClick={() => onSelectDay(cell.iso)}
              className={`
                relative flex h-11 w-full items-center justify-center cursor-pointer
                transition-all duration-150
                ${cell.isSelected ? "z-10" : ""}
              `}
              aria-label={`${cell.iso} ${cell.phase}`}
            >
              {/* Period pill bridge — only extends right, contained within cell */}
              {isPeriod && hasPeriodNext && (
                <div
                  className="absolute inset-y-2 left-1/2 w-[150%] rounded-full"
                  style={{ backgroundColor: style.bg }}
                />
              )}
              {isPeriod && !hasPeriodNext && (
                <div
                  className="absolute inset-y-2 right-[-25%] left-1/2 rounded-l-full"
                  style={{ backgroundColor: style.bg, width: "75%" }}
                />
              )}

              {/* Main circle */}
              <div
                className={`
                  relative z-10 flex h-9 w-9 items-center justify-center rounded-full
                  text-[13px] font-medium
                  ${cell.isSelected ? "ring-2 scale-108" : ""}
                `}
                style={{
                  backgroundColor: cell.isSelected ? "var(--color-primary)" : style.bg,
                  color: cell.isSelected ? "#fff" : style.text,
                  border: !cell.isSelected && style.border !== "transparent"
                    ? `1.5px solid ${style.border}`
                    : cell.isToday && !cell.isSelected
                    ? "1.5px solid var(--color-primary)"
                    : "none",
                  boxShadow: cell.isSelected ? "0 2px 8px rgba(123,79,158,0.3)" : "none",
                }}
              >
                {cell.day}
              </div>

              {/* Period dot indicator */}
              {isPeriod && cell.isLogged && (
                <div
                  className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full"
                  style={{ backgroundColor: "var(--color-period)", opacity: 0.7 }}
                />
              )}

              {/* Ovulation star */}
              {cell.phase === "ovulation" && (
                <div
                  className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[7px]"
                  style={{ color: "#F59E0B", opacity: 0.8 }}
                >
                  ✦
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
