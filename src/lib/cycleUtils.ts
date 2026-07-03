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
 * Uses date-keyed entries: logged period days always overwrite predictions.
 * Only predicts ONE cycle ahead from the last confirmed period start.
 * No additive stacking because:
 *   - Every date has exactly one entry in the map
 *   - Logged period days are written first
 *   - Phases between logged cycles are derived from actual dates
 *   - Only ONE future cycle is predicted (not 6 months of overlapping windows)
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

  // Sort cycles chronologically (oldest first)
  const sorted = [...cycles].sort(
    (a, b) => toTime(a.periodStart) - toTime(b.periodStart)
  );

  // ── 1. Process each logged cycle ──
  for (let i = 0; i < sorted.length; i++) {
    const cycle = sorted[i];
    const start = new Date(cycle.periodStart);
    const end = cycle.periodEnd
      ? new Date(cycle.periodEnd)
      : new Date(start.getTime() + (P - 1) * MS_PER_DAY);

    // 1a. Write actual period days (logged — always wins)
    const d = new Date(start);
    while (d <= end) {
      const iso = d.toISOString().slice(0, 10);
      phaseMap.set(iso, "menstrual");
      loggedDates.add(iso);
      d.setDate(d.getDate() + 1);
    }

    // 1b. Derive phases between this cycle and the next logged cycle
    //     using the ACTUAL dates (not an average).
    const nextStart =
      i < sorted.length - 1
        ? new Date(sorted[i + 1].periodStart)
        : null;

    if (nextStart) {
      const actualCycleLength = Math.round(
        (nextStart.getTime() - start.getTime()) / MS_PER_DAY
      );
      // Ovulation ≈ cycleLength - 14 (luteal phase is relatively fixed)
      const O = Math.max(1, actualCycleLength - 14);

      for (let day = 1; day <= actualCycleLength; day++) {
        const date = new Date(start.getTime() + (day - 1) * MS_PER_DAY);
        const iso = date.toISOString().slice(0, 10);
        // Skip dates that are already logged period days
        if (loggedDates.has(iso)) continue;

        let phase: CyclePhase;
        if (day <= P) continue; // already logged
        else if (day >= O - 3 && day <= O + 1) {
          phase = day === O ? "ovulation" : "fertile";
        } else if (day > O + 1) {
          phase = "luteal";
        } else {
          phase = "follicular";
        }
        // Only set if not already set (first write wins within a cycle)
        if (!phaseMap.has(iso)) {
          phaseMap.set(iso, phase);
        }
      }
    } else {
      // No next cycle yet — fill phases for the current cycle out to cycleLen
      // using the user's average cycle length (L) as the expected duration.
      const O = Math.max(1, L - 14);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let day = 1; day <= L; day++) {
        const date = new Date(start.getTime() + (day - 1) * MS_PER_DAY);
        const iso = date.toISOString().slice(0, 10);
        if (loggedDates.has(iso)) continue;

        let phase: CyclePhase;
        if (day <= P) continue;
        else if (day >= O - 3 && day <= O + 1) {
          phase = day === O ? "ovulation" : "fertile";
        } else if (day > O + 1) {
          phase = "luteal";
        } else {
          phase = "follicular";
        }
        // Show all future dates + a few past days to fill visible calendar
        if (date >= new Date(today.getTime() - 60 * MS_PER_DAY)) {
          if (!phaseMap.has(iso)) {
            phaseMap.set(iso, phase);
          }
        }
      }
    }
  }

  // ── 2. After last logged cycle, predict ONE cycle forward ──
  if (sorted.length > 0) {
    const last = sorted[sorted.length - 1];
    const lastStart = new Date(last.periodStart);

    // Use actual cycle length from last two cycles, or fall back to average
    let cycleLen = L;
    if (sorted.length >= 2) {
      const prev = sorted[sorted.length - 2];
      cycleLen = Math.round(
        (lastStart.getTime() - new Date(prev.periodStart).getTime()) / MS_PER_DAY
      );
      cycleLen = Math.min(45, Math.max(21, cycleLen));
    }

    const predictedStart = new Date(lastStart.getTime() + cycleLen * MS_PER_DAY);
    const O = Math.max(1, cycleLen - 14);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= cycleLen; day++) {
      const date = new Date(predictedStart.getTime() + (day - 1) * MS_PER_DAY);
      const iso = date.toISOString().slice(0, 10);

      // Only show predicted phases for future dates
      if (date < today) continue;
      if (loggedDates.has(iso)) continue;

      let phase: CyclePhase;
      if (day <= P) {
        phase = "menstrual";
      } else if (day >= O - 3 && day <= O + 1) {
        phase = day === O ? "ovulation" : "fertile";
      } else if (day > O + 1) {
        phase = "luteal";
      } else {
        phase = "follicular";
      }
      if (!phaseMap.has(iso)) {
        phaseMap.set(iso, phase);
      }
    }
  }

  // ── 3. No logged cycles — use onboarding defaults for a basic guess ──
  if (sorted.length === 0) {
    const start = new Date();
    start.setDate(start.getDate() - (P - 1));
    const O = Math.max(1, L - 14);

    for (let day = 1; day <= L; day++) {
      const date = new Date(start.getTime() + (day - 1) * MS_PER_DAY);
      const iso = date.toISOString().slice(0, 10);

      let phase: CyclePhase;
      if (day <= P) {
        phase = "menstrual";
        loggedDates.add(iso);
      } else if (day >= O - 3 && day <= O + 1) {
        phase = day === O ? "ovulation" : "fertile";
      } else if (day > O + 1) {
        phase = "luteal";
      } else {
        phase = "follicular";
      }
      phaseMap.set(iso, phase);
    }
  }

  return { phaseMap, loggedDates };
}
