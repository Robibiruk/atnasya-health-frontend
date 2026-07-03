// DayDetailPanel — slide-up panel showing selected day info.
import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { CyclePhase, SymptomEntry } from "../../types";
import { getDayOfCycle, phaseColor, getPhaseDetails } from "../../lib/cycleUtils";

interface DayDetailPanelProps {
  date: string | null;
  lastPeriodStart: string | null;
  cycleLength: number;
  periodDuration: number;
  symptoms: SymptomEntry | null;
  onClose: () => void;
  onLogNow: () => void;
}

function phaseDescription(phase: CyclePhase): string {
  switch (phase) {
    case "menstrual":
      return "Rest and take it easy on your body.";
    case "follicular":
      return "Rising energy — great time for new habits.";
    case "fertile":
      return "Your most fertile window — energy is high.";
    case "ovulation":
      return "Ovulation day — peak fertility.";
    case "luteal":
      return "Slow down and nurture yourself.";
    default:
      return "Log more cycles to see phase details.";
  }
}

export function DayDetailPanel({
  date,
  lastPeriodStart,
  cycleLength,
  periodDuration,
  symptoms,
  onClose,
  onLogNow,
}: DayDetailPanelProps) {
  if (!date) return null;

  const dayOfCycle = lastPeriodStart
    ? getDayOfCycle(lastPeriodStart, new Date(date))
    : null;
  const details = dayOfCycle
    ? getPhaseDetails(dayOfCycle, periodDuration, cycleLength)
    : null;
  const color = details?.color ?? phaseColor("unknown");

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="absolute bottom-0 left-0 right-0 z-20 rounded-t-[20px] bg-card shadow-[0_-4px_20px_rgba(0,0,0,0.15)] p-4"
      style={{ height: 140 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[12px] font-semibold text-white"
            style={{ backgroundColor: color }}
          >
            {details?.phaseLabel ?? "Unknown"}
          </span>
          {dayOfCycle && (
            <span className="text-[13px] text-muted">Day {dayOfCycle} of cycle</span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-card-hover cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Phase description */}
      <p className="text-[13px] text-muted mb-3">
        {details ? phaseDescription(details.phase) : "No data for this day."}
      </p>

      {/* Symptoms or log prompt */}
      {symptoms && symptoms.items.length > 0 ? (
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {symptoms.items.slice(0, 3).map((item, i) => (
            <span
              key={i}
              className="flex-shrink-0 rounded-full px-3 py-1 text-[11px] font-medium bg-card-hover text-text"
            >
              {item.name} · {item.intensity}/5
            </span>
          ))}
        </div>
      ) : (
        <button
          type="button"
          onClick={onLogNow}
          className="flex items-center gap-1 text-[13px] text-primary font-semibold cursor-pointer hover:underline"
        >
          Log now →
        </button>
      )}
    </motion.div>
  );
}
