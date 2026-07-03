// PhaseChip — pulsing pill badge: "Ovulation · Day 14"
import type { CyclePhase } from "../../types";
import { phaseColor } from "../../lib/cycleUtils";

interface PhaseChipProps {
  phase: CyclePhase;
  dayOfCycle: number | null;
}

const labels: Record<CyclePhase, string> = {
  menstrual: "Menstrual",
  follicular: "Follicular",
  fertile: "Fertile",
  ovulation: "Ovulation",
  luteal: "Luteal",
  unknown: "Unknown",
};

export function PhaseChip({ phase, dayOfCycle }: PhaseChipProps) {
  const color = phaseColor(phase);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-[13px] font-semibold text-white animate-pulsering"
      style={{ backgroundColor: color }}
    >
      <svg width="8" height="8" viewBox="0 0 8 8">
        <circle cx="4" cy="4" r="3" fill="white" opacity="0.8" />
      </svg>
      <span>
        {labels[phase]}
        {dayOfCycle ? ` · Day ${dayOfCycle}` : ""}
      </span>
    </span>
  );
}
