// CycleRing — SVG donut chart (260px) split into phase arcs with draw-on animation.
import { useEffect, useState } from "react";
import { useCycleStore } from "../../store/cycleStore";

interface ArcDef {
  label: string;
  days: number;
  color: string; // CSS variable name
}

const PHASE_ARCS: ArcDef[] = [
  { label: "Period", days: 5, color: "var(--color-period)" },
  { label: "Follicular", days: 4, color: "var(--color-follicular)" },
  { label: "Fertile", days: 7, color: "var(--color-fertile)" },
  { label: "Ovulation", days: 1, color: "var(--color-ovulation)" },
  { label: "Luteal", days: 7, color: "var(--color-pms)" },
];

const RADIUS = 100;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 3; // degrees gap between arcs
const TOTAL_DAYS = PHASE_ARCS.reduce((s, a) => s + a.days, 0);

export function CycleRing() {
  const phase = useCycleStore((s) => s.currentPhase);
  const dayOfCycle = useCycleStore((s) => s.dayOfCycle);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Build arc segments
  const arcs: Array<{
    color: string;
    dashArray: number;
    dashOffset: number;
    rotation: number;
    strokeWidth: number;
  }> = [];

  let cumRotation = 0;
  for (const arc of PHASE_ARCS) {
    const fraction = arc.days / TOTAL_DAYS;
    const arcLength = fraction * CIRCUMFERENCE - GAP;
    const isOvulation = arc.label === "Ovulation";
    arcs.push({
      color: arc.color,
      dashArray: arcLength,
      dashOffset: animate ? 0 : arcLength,
      rotation: cumRotation,
      strokeWidth: isOvulation ? 22 : 18,
    });
    cumRotation += fraction * 360;
  }

  const phaseLabel = phase === "unknown" ? "—" : phase.charAt(0).toUpperCase() + phase.slice(1);
  const displayDay = dayOfCycle ?? "—";

  return (
    <div className="flex flex-col items-center">
      <svg width="260" height="260" viewBox="0 0 260 260">
        {/* Background track */}
        <circle
          cx="130"
          cy="130"
          r={RADIUS}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="18"
          opacity="0.3"
        />
        {/* Phase arcs */}
        {arcs.map((arc, i) => (
          <circle
            key={i}
            cx="130"
            cy="130"
            r={RADIUS}
            fill="none"
            stroke={arc.color}
            strokeWidth={arc.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={arc.dashArray}
            strokeDashoffset={arc.dashOffset}
            transform={`rotate(${arc.rotation + 90} 130 130)`}
            style={{
              transition: `stroke-dashoffset 1.4s ease-out ${i * 0.15}s`,
            }}
          />
        ))}
        {/* Today marker dot */}
        {dayOfCycle && (
          <circle
            cx="130"
            cy={130 - RADIUS}
            r="6"
            fill="var(--color-accent)"
            transform={`rotate(${(dayOfCycle / TOTAL_DAYS) * 360} 130 130)`}
          />
        )}
        {/* Center labels */}
        <text
          x="130"
          y="122"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-text"
          style={{ fontSize: 32, fontWeight: 700, fontFamily: "Plus Jakarta Sans, sans-serif" }}
        >
          Day {displayDay}
        </text>
        <text
          x="130"
          y="150"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-muted"
          style={{ fontSize: 13, fontFamily: "Plus Jakarta Sans, sans-serif" }}
        >
          {phaseLabel}
        </text>
      </svg>
    </div>
  );
}
