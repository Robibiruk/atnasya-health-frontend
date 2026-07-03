// cycleUtils.test.ts — mirror the backend prediction tests on client-side utils.
import {
  predictNextCycle,
  getCurrentPhase,
  getDayOfCycle,
} from "../lib/cycleUtils";

let passed = 0;
let failed = 0;

function assert(name: string, condition: unknown): void {
  if (condition) {
    passed += 1;
    console.log(`  ✅ ${name}`);
  } else {
    failed += 1;
    console.error(`  ❌ ${name}`);
  }
}

// Deterministic date helper: 2026-01-01 + n days (UTC).
function day(n: number): Date {
  return new Date(Date.UTC(2026, 0, 1 + n));
}

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function run(): void {
  console.log("cycleUtils.test");

  // 1. Less than 2 cycles → returns null
  assert(
    "Less than 2 cycles → returns null",
    predictNextCycle([{ periodStart: iso(day(0)), cycleLength: 28 }]) === null
  );

  // 2. 3 cycles of 28 days → predicts next period correctly
  const three28 = [
    { periodStart: iso(day(84)), cycleLength: 28 },
    { periodStart: iso(day(56)), cycleLength: 28 },
    { periodStart: iso(day(28)), cycleLength: 28 },
  ];
  const pred28 = predictNextCycle(three28);
  assert("3×28 → avgLength is 28", pred28?.avgLength === 28);
  assert(
    "3×28 → nextPeriod is 28 days after last start",
    pred28?.nextPeriod === iso(day(112))
  );
  assert(
    "3×28 → ovulationDay is 14 days before next period",
    pred28?.ovulationDay === iso(day(98))
  );

  // 3. Irregular cycles (25, 30, 27) → averages to 27
  const irregular = [
    { periodStart: iso(day(82)), cycleLength: 27 },
    { periodStart: iso(day(52)), cycleLength: 30 },
    { periodStart: iso(day(27)), cycleLength: 25 },
  ];
  const predIrr = predictNextCycle(irregular);
  assert("Irregular (25,30,27) → avgLength is 27", predIrr?.avgLength === 27);

  // 4. getCurrentPhase with today in period → returns "menstrual"
  const inPeriod = [
    { periodStart: iso(day(10)), periodEnd: iso(day(14)), cycleLength: 28 },
  ];
  assert(
    "Today in period → menstrual",
    getCurrentPhase(inPeriod, day(12)) === "menstrual"
  );

  // 5. getCurrentPhase with today 5 days before ovulation → returns "fertile"
  const fertileCase = [
    { periodStart: iso(day(38)), cycleLength: 28 },
    { periodStart: iso(day(10)), cycleLength: 28 },
  ];
  assert(
    "Today 5 days before ovulation → fertile",
    getCurrentPhase(fertileCase, day(47)) === "fertile"
  );

  // 6. getDayOfCycle returns 1-indexed day
  assert("getDayOfCycle day 0 → 1", getDayOfCycle(iso(day(10)), day(10)) === 1);
  assert("getDayOfCycle day 13 → 14", getDayOfCycle(iso(day(10)), day(23)) === 14);

  // 7. No cycles → unknown
  assert("No cycles → unknown", getCurrentPhase([], day(10)) === "unknown");

  console.log(`\ncycleUtils: ${passed} passed, ${failed} failed`);
}

run();
