// CycleRingSVG — SVG donut with dynamic phase arcs computed from real data.
import { useEffect, useState } from "react";
import { useCycleStore } from "../../store/cycleStore";
import { useAuthStore } from "../../store/authStore";
import { getPhaseDetails, phaseColor } from "../../lib/cycleUtils";

interface Segment {
  phase: string;
  startDay: number;
  endDay: number;
  color: string;
}

export function CycleRingSVG() {
  const currentPhase = useCycleStore((s) => s.currentPhase);
  const dayOfCycle = useCycleStore((s) => s.dayOfCycle);
  const prediction = useCycleStore((s) => s.prediction);
  const onboardingData = useAuthStore((s) => s.onboarding);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(t);
  }, []);

  const cycleLength = prediction?.avgLength ?? onboardingData?.cycleLength ?? 28;
  const periodDuration = onboardingData?.periodLength ?? 5;
  const day = dayOfCycle ?? 1;
  const totalDays = cycleLength;

  // Build phase segments
  const segments: Segment[] = [];
  for (let d = 1; d <= totalDays; d++) {
    const det = getPhaseDetails(d, periodDuration, cycleLength);
    const lastSeg = segments[segments.length - 1];
    if (lastSeg && lastSeg.phase === det.phase) {
      lastSeg.endDay = d;
    } else {
      segments.push({ phase: det.phase, startDay: d, endDay: d, color: det.color });
    }
  }

  const SIZE = 240;
  const CENTER = SIZE / 2;
  const RADIUS = 90;
  const STROKE = 16;
  const CIRC = 2 * Math.PI * RADIUS;

  return (
    <div className="flex flex-col items-center">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {/* Background track */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={STROKE}
          opacity="0.25"
        />
        {/* Phase segments */}
        {segments.map((seg, i) => {
          const segDays = seg.endDay - seg.startDay + 1;
          const fraction = segDays / totalDays;
          const dashLen = fraction * CIRC;
          const gapLen = CIRC - dashLen;
          // Start angle: each segment starts where the previous ended
          const prevSegments = segments.slice(0, i);
          const prevFraction = prevSegments.reduce((s, sg) => s + (sg.endDay - sg.startDay + 1) / totalDays, 0);
          const startOffset = prevFraction * CIRC;

          return (
            <circle
              key={i}
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              stroke={seg.color}
              strokeWidth={STROKE}
              strokeLinecap="butt"
              strokeDasharray={`${dashLen} ${gapLen}`}
              strokeDashoffset={animate ? -startOffset : CIRC - startOffset}
              transform={`rotate(-90 ${CENTER} ${CENTER})`}
              style={{ transition: `stroke-dashoffset 1.4s ease-out ${i * 0.1}s` }}
            />
          );
        })}
        {/* Today marker dot */}
        {dayOfCycle && dayOfCycle >= 1 && (
          <circle
            cx={CENTER}
            cy={CENTER - RADIUS}
            r={6}
            fill="var(--color-accent)"
            transform={`rotate(${(dayOfCycle / totalDays) * 360} ${CENTER} ${CENTER})`}
          />
        )}
        {/* Center labels */}
        <text
          x={CENTER}
          y={CENTER - 8}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-text"
          style={{ fontSize: 30, fontWeight: 700, fontFamily: "Plus Jakarta Sans, sans-serif" }}
        >
          Day {day}
        </text>
        <text
          x={CENTER}
          y={CENTER + 16}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-muted"
          style={{ fontSize: 13, fontFamily: "Plus Jakarta Sans, sans-serif" }}
        >
          of {cycleLength}
        </text>
      </svg>
    </div>
  );
}
