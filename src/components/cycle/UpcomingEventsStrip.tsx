// UpcomingEventsStrip — horizontal scroll of next 3 upcoming events.
import { motion } from "framer-motion";
import { useCycleStore } from "../../store/cycleStore";
import { useAuthStore } from "../../store/authStore";
import { getPhaseDetails, phaseColor } from "../../lib/cycleUtils";
import { useEffect, useState } from "react";

interface EventItem {
  label: string;
  color: string;
  daysUntil: number;
  isToday: boolean;
}

// Map phase key to emoji
const PHASE_EMOJI: Record<string, string> = {
  menstrual: "🩸",
  follicular: "💙",
  fertile: "🌿",
  ovulation: "✨",
  luteal: "🌙",
};

export function UpcomingEventsStrip() {
  const currentPhase = useCycleStore((s) => s.currentPhase);
  const dayOfCycle = useCycleStore((s) => s.dayOfCycle);
  const prediction = useCycleStore((s) => s.prediction);
  const onboardingData = useAuthStore((s) => s.onboarding);
  const [events, setEvents] = useState<EventItem[]>([]);

  const cycleLength = prediction?.avgLength ?? onboardingData?.cycleLength ?? 28;
  const periodDuration = onboardingData?.periodLength ?? 5;
  const day = dayOfCycle ?? 1;

  useEffect(() => {
    const items: EventItem[] = [];
    const MAX_LOOKAHEAD = cycleLength * 2; // look ahead up to 2 cycles

    // Scan days from today onward to find upcoming phase starts
    let lastPhase = "";
    for (let d = day; d <= day + MAX_LOOKAHEAD; d++) {
      const cycleDay = ((d - 1) % cycleLength) + 1;
      const det = getPhaseDetails(cycleDay, periodLengthInCycle(cycleDay, periodDuration, cycleLength), cycleLength);

      if (det.phase !== lastPhase) {
        const daysUntil = d - day;
        if (daysUntil > 0) {
          items.push({
            label: det.phaseLabel === "Ovulation" ? "Ovulation" : det.phaseLabel,
            color: det.color,
            daysUntil,
            isToday: false,
          });
        }
        lastPhase = det.phase;
      }
    }

    // Show next 3 events
    setEvents(items.slice(0, 3));
  }, [day, cycleLength, periodDuration]);

  if (!events.length) return null;

  return (
    <div>
      <h3 className="text-[14px] font-semibold text-text mb-3">Upcoming</h3>
      <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory">
        {events.map((ev, i) => (
          <motion.div
            key={`${ev.label}-${i}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 + i * 0.08, duration: 0.3 }}
            className="flex-shrink-0 snap-start rounded-full px-4 py-2 flex items-center gap-2 border"
            style={{
              backgroundColor: `color-mix(in srgb, ${ev.color} 12%, var(--color-card))`,
              borderColor: `color-mix(in srgb, ${ev.color} 30%, var(--color-border))`,
            }}
          >
            <span className="text-[14px]">{PHASE_EMOJI[ev.label.toLowerCase()] ?? "•"}</span>
            <span className="text-[13px] font-semibold whitespace-nowrap" style={{ color: ev.color }}>
              {ev.label}
            </span>
            <span
              className="text-[12px] font-bold rounded-full px-2 py-0.5"
              style={{
                backgroundColor: ev.color,
                color: "white",
              }}
            >
              {ev.daysUntil === 0 ? "Today" : `in ${ev.daysUntil}d`}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Helper: period only applies on days 1..periodDuration, otherwise normal periodDuration
function periodLengthInCycle(cycleDay: number, periodDuration: number, _cycleLength: number): number {
  return periodDuration;
}
