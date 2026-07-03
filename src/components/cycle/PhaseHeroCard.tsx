// PhaseHeroCard — large hero showing current phase + countdown.
import { motion } from "framer-motion";
import { useCycleStore } from "../../store/cycleStore";
import { useAuthStore } from "../../store/authStore";
import { getPhaseDetails } from "../../lib/cycleUtils";

export function PhaseHeroCard() {
  const currentPhase = useCycleStore((s) => s.currentPhase);
  const dayOfCycle = useCycleStore((s) => s.dayOfCycle);
  const prediction = useCycleStore((s) => s.prediction);
  const onboardingData = useAuthStore((s) => s.onboarding);
  const goal = useAuthStore((s) => s.goal);

  // Compute cycleLength + periodDuration from real data or fallbacks
  const cycleLength = prediction?.avgLength ?? onboardingData?.cycleLength ?? 28;
  const periodDuration = onboardingData?.periodLength ?? 5;
  const day = dayOfCycle ?? 1;

  const details = getPhaseDetails(day, periodDuration, cycleLength);

  // Determine display based on phase
  let bigNumber: string;
  let bigLabel: string;
  let subLabel: string;
  let showPulse = false;

  switch (details.phase) {
    case "menstrual":
      bigNumber = String(details.daysIntoPhase);
      bigLabel = "of your period";
      subLabel = `Ends in ~${details.daysUntilNextPhase} days`;
      showPulse = true;
      break;
    case "follicular":
      bigNumber = String(details.daysUntilFertile);
      bigLabel = "days until fertile";
      subLabel = `Period ended ${day - periodDuration > 0 ? day - periodDuration : 0} days ago`;
      break;
    case "fertile":
      bigNumber = String(details.daysUntilOvulation);
      bigLabel = "days until ovulation";
      subLabel = goal === "conceive" ? "High chance of conception" : "Fertile window open";
      break;
    case "ovulation":
      bigNumber = "TODAY";
      bigLabel = "Peak fertility";
      subLabel = "Ovulation day — highest chance of conception";
      showPulse = true;
      break;
    case "luteal":
      bigNumber = String(details.daysUntilPeriod);
      bigLabel = "days until period";
      subLabel = details.daysUntilPeriod <= 7 ? "PMS window approaching" : `Next period in ${details.daysUntilPeriod}d`;
      break;
    default:
      bigNumber = "—";
      bigLabel = "Log period to begin";
      subLabel = "";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-card shadow-card p-6 text-center space-y-4 bg-card"
    >
      {/* Phase chip */}
      <div className="flex justify-center">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-semibold text-white ${showPulse ? "animate-pulsering" : ""}`}
          style={{ backgroundColor: details.color }}
        >
          {details.phase === "menstrual" && "🌸 "}
          {details.phase === "follicular" && "💙 "}
          {details.phase === "fertile" && "🌿 "}
          {details.phase === "ovulation" && "✨ "}
          {details.phase === "luteal" && "🌙 "}
          {details.phaseLabel}
          {details.phase !== "ovulation" ? ` · Day ${day}` : ""}
        </span>
      </div>

      {/* Big countdown */}
      <div>
        <p
          className={`font-bold leading-none ${bigNumber === "TODAY" ? "text-[36px]" : "text-[64px]"}`}
          style={{ color: details.color }}
        >
          {bigNumber}
        </p>
        <p className="mt-2 text-[15px] text-muted">{bigLabel}</p>
      </div>

      {/* Sub-label */}
      {subLabel && (
        <p className="text-[13px] text-subtle">{subLabel}</p>
      )}

      {/* Progress arc (SVG) */}
      <div className="flex justify-center pt-2">
        <svg width="120" height="60" viewBox="0 0 120 60">
          {/* Background arc */}
          <path
            d="M 10 55 A 50 50 0 0 1 110 55"
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <motion.path
            d="M 10 55 A 50 50 0 0 1 110 55"
            fill="none"
            stroke={details.color}
            strokeWidth="8"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{
              pathLength:
                details.phase === "menstrual"
                  ? details.daysIntoPhase / periodDuration
                  : details.phase === "luteal"
                  ? (cycleLength - details.daysUntilPeriod) / cycleLength
                  : details.phase === "ovulation"
                  ? 0.5
                  : (day / cycleLength),
            }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          />
        </svg>
      </div>
    </motion.div>
  );
}
