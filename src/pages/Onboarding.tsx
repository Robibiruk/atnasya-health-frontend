// Onboarding — multi-step wizard with role selection fork.
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useOnboarding, type OnboardingData } from "../hooks/useOnboarding";
import { ProgressBar } from "../components/onboarding/ProgressBar";
import { StepRole } from "../components/onboarding/StepRole";
import { StepPartnerWelcome } from "../components/onboarding/StepPartnerWelcome";
import { StepPartnerCode } from "../components/onboarding/StepPartnerCode";
import { StepGoal } from "../components/onboarding/StepGoal";
import { StepLastPeriod } from "../components/onboarding/StepLastPeriod";
import { StepDuration } from "../components/onboarding/StepDuration";
import { StepCycleLength } from "../components/onboarding/StepCycleLength";
import { StepBirthYear } from "../components/onboarding/StepBirthYear";
import { StepPregnancy } from "../components/onboarding/StepPregnancy";
import { StepNotifications } from "../components/onboarding/StepNotifications";
import { api } from "../lib/api";

const TRACKER_TOTAL_STEPS = 7;

export function Onboarding() {
  const navigate = useNavigate();
  const onboardingCompleted = useAuthStore((s) => s.onboardingCompleted);
  const userRole = useAuthStore((s) => s.role);
  const setOnboarding = useAuthStore((s) => s.setOnboarding);
  const { completeOnboarding } = useOnboarding();

  // Role selection (Step 0)
  const [role, setRole] = useState<"tracker" | "partner" | null>(null);

  // Shared step counter (resets when role is chosen)
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);

  // Partner flow state
  const [partnerName, setPartnerName] = useState("");

  // Tracker flow state
  const [goal, setGoal] = useState<OnboardingData["goal"]>("track");
  const [periodStart, setPeriodStart] = useState<string | null>(
    new Date().toISOString().slice(0, 10)
  );
  const [periodLength, setPeriodLength] = useState(5);
  const [cycleLength, setCycleLength] = useState(28);
  const [birthYear, setBirthYear] = useState<number | null>(
    new Date().getFullYear() - 25
  );
  const [pregnant, setPregnant] = useState<boolean | null>(null);
  const [notificationPrefs, setNotificationPrefs] = useState({
    periodReminders: true,
    ovulationAlerts: true,
    dailyLogReminder: false,
  });

  // Guard: skip onboarding if already completed — use <Navigate> NOT navigate() in render
  if (onboardingCompleted) {
    if (userRole === "partner") return <Navigate to="/partner-dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  const goNext = () => {
    setDirection(1);
    setStep(step + 1);
  };

  const goBack = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(step - 1);
    }
  };

  // Role selected → advance to role-specific step 1
  const handleRoleNext = () => {
    if (!role) return;
    setOnboarding({ role });
    goNext();
  };

  // Partner flow: connected → save + redirect
  const handlePartnerConnected = async (_ownerFirstName: string) => {
    setLoading(true);
    try {
      await api.put("/auth/settings", {
        role: "partner",
        name: partnerName,
        onboardingCompleted: true,
      });
      setOnboarding({ role: "partner", onboardingCompleted: true });
      // Use window.location to force full page reload and clear all state
      window.location.href = "/partner-dashboard";
    } catch {
      setLoading(false);
    }
  };

  // Tracker flow: finish
  const handleTrackerFinish = async () => {
    setLoading(true);
    try {
      await completeOnboarding({
        goal,
        periodStart,
        periodLength,
        cycleLength,
        birthYear: birthYear ?? new Date().getFullYear() - 25,
        pregnant,
        notificationPrefs,
      });
      setOnboarding({ role: "tracker", onboardingCompleted: true });
      window.location.href = "/";
    } catch {
      setLoading(false);
    }
  };

  // Step 6 (pregnancy) is conditional — show only for non-conceive/avoid goals
  const showPregnancy = goal !== "conceive" && goal !== "avoid";

  // Compute actual step number for progress (pregnancy may be skipped)
  const trackerProgressStep = showPregnancy ? step : step <= 5 ? step : step + 1;

  const isPartner = role === "partner";

  return (
    <div className="min-h-screen bg-surface px-5 pt-8 pb-12">
      {/* Progress bar — only for tracker flow, steps 1+ */}
      {!isPartner && step > 0 && (
        <ProgressBar current={Math.min(trackerProgressStep, TRACKER_TOTAL_STEPS)} total={TRACKER_TOTAL_STEPS} />
      )}

      {/* Back button — not on role selection or partner code step */}
      {step > 0 && !(isPartner && step === 2) && (
        <button
          type="button"
          onClick={goBack}
          aria-label="Go back"
          className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card cursor-pointer transition-colors duration-150 hover:bg-card-hover"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={`${role}-${step}`}
          custom={direction}
          initial={{ x: direction > 0 ? 40 : -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction > 0 ? -40 : 40, opacity: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
        >
          {/* Step 0: Role selection */}
          {step === 0 && (
            <StepRole
              selected={role}
              onSelect={setRole}
              onNext={handleRoleNext}
            />
          )}

          {/* Partner flow: Step 1 = name, Step 2 = code */}
          {isPartner && step === 1 && (
            <StepPartnerWelcome
              name={partnerName}
              onChange={setPartnerName}
              onNext={goNext}
            />
          )}
          {isPartner && step === 2 && (
            <StepPartnerCode
              onBack={goBack}
              onConnected={handlePartnerConnected}
              onError={() => {}}
            />
          )}

          {/* Tracker flow */}
          {!isPartner && step === 1 && (
            <StepGoal goal={goal} onSelect={setGoal} onNext={goNext} />
          )}
          {!isPartner && step === 2 && (
            <StepLastPeriod periodStart={periodStart} onSelect={setPeriodStart} onNext={goNext} />
          )}
          {!isPartner && step === 3 && (
            <StepDuration periodLength={periodLength} onSelect={setPeriodLength} onNext={goNext} />
          )}
          {!isPartner && step === 4 && (
            <StepCycleLength cycleLength={cycleLength} onChange={setCycleLength} onNext={goNext} />
          )}
          {!isPartner && step === 5 && (
            <StepBirthYear birthYear={birthYear} onChange={setBirthYear} onNext={goNext} />
          )}
          {!isPartner && step === 6 && showPregnancy && (
            <StepPregnancy pregnant={pregnant} onSelect={setPregnant} onNext={goNext} />
          )}
          {!isPartner && (step === 7 || (step === 6 && !showPregnancy)) && (
            <StepNotifications
              notificationPrefs={notificationPrefs}
              onChange={setNotificationPrefs}
              onFinish={handleTrackerFinish}
              loading={loading}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
