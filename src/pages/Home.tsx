// Home — greeting, notification banner, phase hero, cycle ring, upcoming events, insights, quick stats.
import { useEffect, useState } from "react";
import { TopBar } from "../components/layout/TopBar";
import { PhaseHeroCard } from "../components/cycle/PhaseHeroCard";
import { CycleRingSVG } from "../components/cycle/CycleRingSVG";
import { UpcomingEventsStrip } from "../components/cycle/UpcomingEventsStrip";
import { QuickStats } from "../components/cycle/QuickStats";
import { NotificationBanner } from "../components/cycle/NotificationBanner";
import { PregnancyWidget } from "../components/cycle/PregnancyWidget";
import { InsightStoryCards } from "../components/ai/InsightStoryCards";
import { QuickLogSheet } from "../components/layout/QuickLogSheet";
import { useCycle } from "../hooks/useCycle";
import { useInsights } from "../hooks/useInsights";
import { useCycleStore } from "../store/cycleStore";
import { useAuthStore } from "../store/authStore";
import { Spinner } from "../components/ui/Spinner";
import { api } from "../lib/api";

export function Home() {
  const { fetchPrediction, fetchCycles, buildPhaseMap } = useCycle();
  const { fetchToday } = useInsights();
  const cycles = useCycleStore((s) => s.cycles);
  const currentPhase = useCycleStore((s) => s.currentPhase);
  const dayOfCycle = useCycleStore((s) => s.dayOfCycle);
  const prediction = useCycleStore((s) => s.prediction);
  const onboardingCompleted = useAuthStore((s) => s.onboardingCompleted);
  const goal = useAuthStore((s) => s.goal);
  const onboardingData = useAuthStore((s) => s.onboarding);
  const [loading, setLoading] = useState(true);
  const [showKickToast, setShowKickToast] = useState(false);
  const [partnerMessages, setPartnerMessages] = useState<Array<{ message: string; emoji: string; id: string }>>([]);
  const [dismissedMessages, setDismissedMessages] = useState<Set<string>>(new Set());

  // Check if pregnancy mode — when goal is "track" and onboarding says pregnant=true or cycle phase is unknown with longer gaps
  const isPregnancyMode = goal === "track" && onboardingData?.pregnant === true;

  // Compute a mock due date from current date + ~20 weeks if pregnant
  const pregnancyWeek = isPregnancyMode ? Math.min(40, Math.max(4, Math.floor(((dayOfCycle ?? 1) / 28) * 40))) : 0;
  const mockDueDate = isPregnancyMode
    ? new Date(Date.now() + (280 - pregnancyWeek * 7) * 86400000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "";

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchPrediction(), fetchCycles(), fetchToday()]);
      buildPhaseMap();
      // Fetch unread partner messages
      try {
        const res = await api.get("/partner/messages");
        if (res.data.success) {
          const unread = res.data.data.filter((m: any) => !m.read);
          setPartnerMessages(unread);
        }
      } catch { /* not connected or no messages */ }
      setLoading(false);
    };
    load();
  }, [fetchPrediction, fetchCycles, fetchToday]);

  const handleLogKick = () => {
    setShowKickToast(true);
    setTimeout(() => setShowKickToast(false), 2000);
  };

  if (loading) {
    return (
      <div className="pb-24">
        <TopBar />
        <div className="px-5 pt-4">
          <Spinner />
        </div>
      </div>
    );
  }

  // New user empty state: onboarding done but no cycle logged yet
  const isNewUser = onboardingCompleted && cycles.length === 0;

  // Streak from QuickStats data — compute from cycles
  const streak = cycles.length;

  // Cycle status line
  const cycleStatus = currentPhase && dayOfCycle
    ? `Day ${dayOfCycle} · ${currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)}`
    : "Log your first period to begin tracking";

  return (
    <div className="pb-24">
      <TopBar />

      <div className="space-y-4 px-5 pt-3">
        {/* Greeting + cycle status */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] text-muted">Your cycle</p>
            <p className="text-[16px] font-bold text-text">{cycleStatus}</p>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1.5">
              <span className="text-[14px]">🔥</span>
              <span className="text-[12px] font-bold text-accent">{streak}d</span>
            </div>
          )}
        </div>

        {/* Partner messages notification */}
        {partnerMessages.length > 0 && partnerMessages.filter((m) => !dismissedMessages.has(m.id)).length > 0 && (
          <div className="space-y-2">
            {partnerMessages.filter((m) => !dismissedMessages.has(m.id)).slice(0, 3).map((msg) => (
              <div key={msg.id} className="rounded-btn flex items-start gap-3 px-4 py-3 bg-accent/10 border border-accent/20">
                <span className="text-[20px]">{msg.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-text">Message from partner</p>
                  <p className="text-[13px] text-muted">{msg.message}</p>
                </div>
                <button type="button" onClick={() => setDismissedMessages((prev) => new Set(prev).add(msg.id))}
                  className="text-[12px] text-muted cursor-pointer hover:text-text flex-shrink-0">✕</button>
              </div>
            ))}
          </div>
        )}

        {/* Notification banner */}
        <NotificationBanner />

        {isNewUser ? (
          <div className="rounded-card bg-card shadow-card p-8 text-center space-y-4">
            <span className="text-[40px]">🌸</span>
            <h2 className="text-[18px] font-bold text-text">You&apos;re all set!</h2>
            <p className="text-[14px] text-muted max-w-[260px] mx-auto">
              Log your first day to start tracking your cycle and get personalized insights.
            </p>
            <div className="pt-2">
              <QuickStats />
            </div>
          </div>
        ) : (
          <>
            {/* Pregnancy mode widget */}
            {isPregnancyMode && (
              <PregnancyWidget
                week={pregnancyWeek}
                dueDate={mockDueDate}
                onLogKick={handleLogKick}
              />
            )}

            {/* Phase hero — big countdown display */}
            <PhaseHeroCard />

            {/* Cycle ring */}
            <CycleRingSVG />

            {/* Upcoming events strip */}
            <UpcomingEventsStrip />

            {/* Quick stats */}
            <QuickStats />
          </>
        )}

        {/* Insight story cards */}
        <div>
          <h2 className="text-[15px] font-bold text-text mb-2">Daily insights</h2>
          <InsightStoryCards />
        </div>
      </div>

      {/* Quick log FAB */}
      <QuickLogSheet />

      {/* Kick counter toast */}
      {showKickToast && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 rounded-full bg-accent px-5 py-2.5 text-[13px] font-semibold text-white shadow-card animate-fade-up">
          Kicks logged ✓
        </div>
      )}
    </div>
  );
}
