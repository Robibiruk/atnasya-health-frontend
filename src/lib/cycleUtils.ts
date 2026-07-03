// Client-side cycle prediction helpers — mirrors the backend cycleService exactly.
// Keep these in sync: backend/src/services/cycleService.ts.
import { CyclePhase, CyclePrediction } from "../types";

export interface CycleInput {
  periodStart: string;
  periodEnd?: string | null;
  cycleLength?: number | null;
}

const MS_PER_DAY = 86_400_000;

function toTime(s: string): number {
  return new Date(s).getTime();
}

/** 1-indexed day of cycle relative to the most recent period start. */
export function getDayOfCycle(lastPeriodStart: string, today: Date): number {
  return Math.floor((today.getTime() - toTime(lastPeriodStart)) / MS_PER_DAY) + 1;
}

/**
 * Predict next period, ovulation day, and fertile window.
 * Minimum 2 cycles required.
 */
export function predictNextCycle(cycles: CycleInput[]): CyclePrediction | null {
  if (cycles.length < 2) return null;

  const lengths = cycles
    .slice(0, 6)
    .map((c) => c.cycleLength)
    .filter((l): l is number => typeof l === "number" && l > 0);

  // Fall back to deriving lengths from consecutive period starts.
  if (lengths.length === 0 && cycles.length >= 2) {
    const sorted = [...cycles]
      .map((c) => toTime(c.periodStart))
      .sort((a, b) => b - a);
    for (let i = 0; i < sorted.length - 1; i++) {
      lengths.push(Math.round((sorted[i] - sorted[i + 1]) / MS_PER_DAY));
    }
  }
  if (lengths.length === 0) return null;

  const avgLength = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
  const lastStart = toTime(cycles[0].periodStart);

  const nextPeriod = new Date(lastStart + avgLength * MS_PER_DAY);
  const ovulationDay = new Date(nextPeriod.getTime() - 14 * MS_PER_DAY);
  const fertileStart = new Date(ovulationDay.getTime() - 5 * MS_PER_DAY);
  const fertileEnd = new Date(ovulationDay.getTime() + 1 * MS_PER_DAY);

  return {
    nextPeriod: nextPeriod.toISOString().slice(0, 10),
    ovulationDay: ovulationDay.toISOString().slice(0, 10),
    fertileStart: fertileStart.toISOString().slice(0, 10),
    fertileEnd: fertileEnd.toISOString().slice(0, 10),
    avgLength,
  };
}

/** Determine current cycle phase for a given day. */
export function getCurrentPhase(cycles: CycleInput[], today: Date): CyclePhase {
  if (!cycles.length) return "unknown";

  const sorted = [...cycles].sort(
    (a, b) => toTime(b.periodStart) - toTime(a.periodStart)
  );
  const last = sorted[0];
  const lastStart = toTime(last.periodStart);
  const lastEnd = last.periodEnd ? toTime(last.periodEnd) : null;
  const dayOfCycle = getDayOfCycle(last.periodStart, today);

  if (lastEnd != null && today.getTime() <= lastEnd && today.getTime() >= lastStart)
    return "menstrual";

  const prediction = predictNextCycle(sorted);
  if (!prediction) return "follicular";

  const todayStr = today.toISOString().slice(0, 10);
  if (todayStr === prediction.ovulationDay) return "ovulation";
  if (todayStr >= prediction.fertileStart && todayStr <= prediction.fertileEnd)
    return "fertile";
  if (dayOfCycle > prediction.avgLength - 7) return "luteal";
  return "follicular";
}

/**
 * Get detailed phase information for a given day of cycle.
 * Works with just cycleLength + periodDuration (no prediction needed).
 * Used by PhaseHeroCard, CycleRingSVG, UpcomingEventsStrip.
 *
 * Phase breakpoints (given periodDuration=P, cycleLength=L):
 *   Period:      days 1 .. P
 *   Follicular:  days P+1 .. O-4
 *   Fertile:     days O-3 .. O+1
 *   Ovulation:   day  = O (peak day within fertile window)
 *   Luteal/PMS:  days O+2 .. L
 * where O = ovulation day ≈ L - 14
 */
export function getPhaseDetails(
  dayOfCycle: number,
  periodDuration: number,
  cycleLength: number
): {
  phase: CyclePhase;
  phaseLabel: string;
  daysIntoPhase: number;
  daysUntilNextPhase: number;
  daysUntilPeriod: number;
  daysUntilOvulation: number;
  daysUntilFertile: number;
  color: string;
} {
  const P = periodDuration;
  const L = cycleLength;
  const O = Math.round(L * 0.5); // ovulation ≈ middle of cycle (L-14 ≈ L*0.5 for L=28)

  // Clamp dayOfCycle to valid range
  const day = Math.max(1, dayOfCycle);

  let phase: CyclePhase;
  let phaseLabel: string;
  let phaseStart: number;
  let phaseEnd: number;

  if (day <= P) {
    phase = "menstrual";
    phaseLabel = "Period";
    phaseStart = 1;
    phaseEnd = P;
  } else if (day >= O - 3 && day <= O + 1) {
    // Fertile window (includes ovulation day)
    if (day === O) {
      phase = "ovulation";
      phaseLabel = "Ovulation";
    } else {
      phase = "fertile";
      phaseLabel = "Fertile";
    }
    phaseStart = O - 3;
    phaseEnd = O + 1;
  } else if (day > O + 1) {
    phase = "luteal";
    phaseLabel = "Luteal";
    phaseStart = O + 2;
    phaseEnd = L;
  } else {
    // Follicular: after period, before fertile window
    phase = "follicular";
    phaseLabel = "Follicular";
    phaseStart = P + 1;
    phaseEnd = O - 4;
  }

  const daysIntoPhase = day - phaseStart + 1;
  const daysUntilNextPhase = Math.max(0, phaseEnd - day + 1);
  const daysUntilPeriod = Math.max(0, L - day);
  const daysUntilOvulation = Math.max(0, O - day);
  const daysUntilFertile = day < O - 3 ? Math.max(0, (O - 3) - day) : 0;

  return {
    phase,
    phaseLabel,
    daysIntoPhase,
    daysUntilNextPhase,
    daysUntilPeriod,
    daysUntilOvulation,
    daysUntilFertile,
    color: phaseColor(phase),
  };
}
export function daysUntil(targetIso: string, from: Date = new Date()): number {
  const target = toTime(targetIso);
  return Math.ceil((target - from.getTime()) / MS_PER_DAY);
}

export function phaseColor(phase: CyclePhase): string {
  switch (phase) {
    case "menstrual":
      return "var(--color-period)";
    case "fertile":
      return "var(--color-fertile)";
    case "ovulation":
      return "var(--color-ovulation)";
    case "luteal":
      return "var(--color-pms)";
    case "follicular":
      return "var(--color-follicular)";
    default:
      return "var(--color-subtle)";
  }
}

/**
 * Build a full-year phase map for calendar coloring.
 * Uses logged cycles for actual period days, then predicts forward 6 months.
 * Returns a phaseMap (date → phase) and loggedDates set (confirmed days).
 *
 * Falls back to avgCycleLength/avgPeriodDuration when < 2 cycles logged.
 */
export function getFullYearPhaseMap(
  cycles: CycleInput[],
  avgCycleLength: number,
  avgPeriodDuration: number
): { phaseMap: Map<string, CyclePhase>; loggedDates: Set<string> } {
  const phaseMap = new Map<string, CyclePhase>();
  const loggedDates = new Set<string>();

  const L = avgCycleLength > 0 ? avgCycleLength : 28;
  const P = avgPeriodDuration > 0 ? avgPeriodDuration : 5;

  // 1. Mark actual period days from logged cycles
  for (const cycle of cycles) {
    const start = new Date(cycle.periodStart);
    const end = cycle.periodEnd
      ? new Date(cycle.periodEnd)
      : new Date(start.getTime() + (P - 1) * MS_PER_DAY);
    const d = new Date(start);
    while (d <= end) {
      const iso = d.toISOString().slice(0, 10);
      phaseMap.set(iso, "menstrual");
      loggedDates.add(iso);
      d.setDate(d.getDate() + 1);
    }
  }

  // 2. Find the last period start (logged or predicted)
  let lastStart: Date;
  if (cycles.length > 0) {
    const sorted = [...cycles].sort(
      (a, b) => toTime(b.periodStart) - toTime(a.periodStart)
    );
    lastStart = new Date(sorted[0].periodStart);
  } else {
    lastStart = new Date();
    lastStart.setDate(lastStart.getDate() - (P - 1));
  }

  // 3. Predict forward 6 months from last period start
  const sixMonthsMs = 180 * MS_PER_DAY;
  const endDate = new Date(Math.max(Date.now(), lastStart.getTime()) + sixMonthsMs);

  let cycleStart = new Date(lastStart);
  // If lastStart is in the past, advance to the next future cycle start
  while (cycleStart.getTime() < Date.now() - L * MS_PER_DAY) {
    cycleStart = new Date(cycleStart.getTime() + L * MS_PER_DAY);
  }

  while (cycleStart <= endDate) {
    // For each day in this cycle, compute its phase
    for (let day = 1; day <= L; day++) {
      const date = new Date(cycleStart.getTime() + (day - 1) * MS_PER_DAY);
      const iso = date.toISOString().slice(0, 10);

      // Skip if already marked as logged period
      if (loggedDates.has(iso)) continue;

      const det = getPhaseDetails(day, P, L);
      // Only overwrite if not already set (logged takes priority)
      if (!phaseMap.has(iso)) {
        phaseMap.set(iso, det.phase);
      }
    }
    cycleStart = new Date(cycleStart.getTime() + L * MS_PER_DAY);
  }

  return { phaseMap, loggedDates };
}
