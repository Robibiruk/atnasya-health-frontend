// Client-side self-care data processing — builds full-year self-care map from logged entries.
// Mirrors the cycleUtils pattern for self-care tracking.

import type { SelfcareInput, SelfcareCard, SelfcareSummary } from "../types";

const MS_PER_DAY = 86_400_000;

/**
 * Build a full-year self-care map from logged entries.
 * Returns selfcareMap (date → SelfcareCard), loggedDates set, and summary.
 */
export function getFullYearSelfcareMap(inputs: SelfcareInput[]): {
  selfcareMap: Map<string, SelfcareCard>;
  loggedDates: Set<string>;
  summary: SelfcareSummary;
} {
  const selfcareMap = new Map<string, SelfcareCard>();
  const loggedDates = new Set<string>();

  // 1. Mark logged self-care entries
  for (const entry of inputs) {
    const iso = entry.date.slice(0, 10);
    const card: SelfcareCard = {
      date: iso,
      mood: entry.mood,
      water: entry.water,
      sleep: entry.sleep,
      energy: entry.energy,
      notes: entry.notes,
    };
    selfcareMap.set(iso, card);
    loggedDates.add(iso);
  }

  // 2. Compute summary statistics
  const validMoods = inputs.filter((e) => e.mood !== null).map((e) => e.mood!);
  const validWaters = inputs.filter((e) => e.water !== null).map((e) => e.water!);
  const validSleeps = inputs.filter((e) => e.sleep !== null).map((e) => e.sleep!);
  const validEnergies = inputs.filter((e) => e.energy !== null).map((e) => e.energy!);

  const average = (arr: number[]) =>
    arr.length > 0 ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : null;

  // Calculate streaks (consecutive days with entries from today backwards)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = today.toISOString().slice(0, 10);

  let moodStreak = 0;
  let waterStreak = 0;
  let sleepStreak = 0;

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const iso = checkDate.toISOString().slice(0, 10);

    const entry = selfcareMap.get(iso);
    if (!entry) break; // streak broken

    if (entry.mood !== null) moodStreak++;
    else break;

    if (entry.water !== null) waterStreak++;
    else break;

    if (entry.sleep !== null) sleepStreak++;
    else break;
  }

  const summary: SelfcareSummary = {
    totalEntries: inputs.length,
    avgMood: average(validMoods),
    avgWater: average(validWaters),
    avgSleep: average(validSleeps),
    avgEnergy: average(validEnergies),
    moodStreak,
    waterStreak,
    sleepStreak,
  };

  return { selfcareMap, loggedDates, summary };
}