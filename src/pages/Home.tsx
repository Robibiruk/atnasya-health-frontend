// Home — greeting, notification banner, phase hero, cycle ring, upcoming events, insights, quick stats.
import { useEffect, useMemo, useState } from "react";
import { TopBar } from "../components/layout/TopBar";
import { PhaseHeroCard } from "../components/cycle/PhaseHeroCard";
import { CycleRingSVG } from "../components/cycle/CycleRingSVG";
import { UpcomingEventsStrip } from "../components/cycle/UpcomingEventsStrip";
import { QuickStats } from "../components/cycle/QuickStats";
import { NotificationBanner } from "../components/cycle/NotificationBanner";
import { PregnancyWidget } from "../components/cycle/PregnancyWidget";
import { InsightStoryCards } from "../components/ai/InsightStoryCards";
import { QuickLogSheet } from "../components/layout/QuickLogSheet";
import { ThemePalettePicker } from "../components/ui/ThemePalettePicker";
import { PetIconDisplay } from "../components/ui/PetIconDisplay";
import { PetPickerModal } from "../components/ui/PetPickerModal";
import { useCycle } from "../hooks/useCycle";
import { useInsights } from "../hooks/useInsights";
import { useCycleStore } from "../store/cycleStore";
import { useAuthStore } from "../store/authStore";
import { Spinner } from "../components/ui/Spinner";
import { api } from "../lib/api";
import { useTranslation } from "react-i18next";

export function Home() {
  const palette = useAuthStore((s) => s.palette);
  const pet = useAuthStore((s) => s.pet);
  const theme = useAuthStore((s) => s.theme);
  const { t, i18n } = useTranslation();
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
  const [dismissedMessages, setDismissedMessages] = useState<Set<string>>(() => {
  try {
    const raw = localStorage.getItem("atnasya-dismissed-messages");
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
  });
  const [petPickerOpen, setPetPickerOpen] = useState(false);

  // Check if pregnancy mode — when goal is "track" and onboarding says pregnant=true or cycle phase is unknown with longer gaps
  const isPregnancyMode = goal === "track" && onboardingData?.pregnant === true;

  // Compute a mock due date from current date + ~20 weeks if pregnant
  const pregnancyWeek = isPregnancyMode ? Math.min(40, Math.max(4, Math.floor(((dayOfCycle ?? 1) / 28) * 40))) : 0;
  const mockDueDate = isPregnancyMode
    ? new Date(Date.now() + (280 - pregnancyWeek * 7) * 86400000).toLocaleDateString(i18n.language === "ar" ? "ar-SA" : i18n.language, { month: "long", day: "numeric", year: "numeric" })
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

  // New user empty state: onboarding done but no cycle logged yet
  const isNewUser = onboardingCompleted && cycles.length === 0;

  // Streak from unique open/logged days derived from cycle dates
  const activeDateKeys = useMemo(() => {
    const keys = new Set<string>();
    const addRange = (start?: string | null, end?: string | null) => {
      if (!start) return;
      const s = new Date(start);
      const e = end ? new Date(end) : new Date(s);
      const d = new Date(s.getFullYear(), s.getMonth(), s.getDate());
      const stop = new Date(e.getFullYear(), e.getMonth(), e.getDate());
      while (d.getTime() <= stop.getTime()) {
        keys.add(d.toISOString().slice(0, 10));
        d.setDate(d.getDate() + 1);
      }
    };
    cycles.forEach((c) => addRange(c.periodStart, c.periodEnd));
    return keys;
  }, [cycles]);
  const todayKey = new Date().toISOString().slice(0, 10);
  const streak = useMemo(() => {
    if (!activeDateKeys.size) return 0;
    let count = 0;
    let d = new Date(todayKey);
    while (activeDateKeys.has(d.toISOString().slice(0, 10))) {
      count += 1;
      d.setDate(d.getDate() - 1);
    }
    return count;
  }, [activeDateKeys]);

  // Cycle status line
  const cycleStatus = currentPhase && dayOfCycle
    ? t("home.cycle.status", { day: dayOfCycle, phase: currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1) })
    : t("home.cycle.empty");

  return (
    <div data-theme={theme} className="pb-24 home-palette-scope" data-home-palette={palette}>
      <TopBar />
      <div className="space-y-4 px-5 pt-3">
        {loading ? (
          <div className="px-5 pt-4"><Spinner /></div>
        ) : (
          <>
            {/* Greeting + cycle status + pet */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPetPickerOpen(true)}
                  className="flex-shrink-0 rounded-full p-0.5 cursor-pointer"
                  title="Change pet"
                >
                  <PetIconDisplay size={28} />
                </button>
                <div>
                  <p className="text-[13px] text-muted">{t("cycle.status")}</p>
                  <p className="text-[16px] font-bold text-text">{cycleStatus}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {streak > 0 && (
                  <div className="flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1.5">
                    <span className="text-[14px]">🔥</span>
                    <span className="text-[12px] font-bold text-accent">{streak}{t("home.streak.days")}</span>
                  </div>
                )}
                <ThemePalettePicker compact />
              </div>
            </div>

            {/* Partner messages notification */}
            {partnerMessages.length > 0 && partnerMessages.filter((m: any) => !dismissedMessages.has(m.id)).length > 0 && (
              <div className="space-y-2">
                {partnerMessages.filter((m: any) => !dismissedMessages.has(m.id)).slice(0, 3).map((msg: any) => (
                  <div key={msg.id} className="rounded-btn flex items-start gap-3 px-4 py-3 bg-accent/10 border border-accent/20">
                    <span className="text-[20px]">{msg.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-text">{t("partner.message.from")}</p>
                      <p className="text-[13px] text-muted">{msg.message}</p>
                    </div>
                    <button type="button" onClick={() => {
                      setDismissedMessages((prev) => {
                        const next = new Set(prev);
                        next.add(msg.id);
                        try {
                          localStorage.setItem("atnasya-dismissed-messages", JSON.stringify([...next]));
                        } catch {}
                        return next;
                      });
                    }}
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
                <h2 className="text-[18px] font-bold text-text">{t("home.all.set")}</h2>
                <p className="text-[14px] text-muted max-w-[260px] mx-auto">
                  {t("home.empty.state")}
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
              <h2 className="text-[15px] font-bold text-text mb-2">{t("home.daily.insights")}</h2>
              <InsightStoryCards />
            </div>
          </>
        )}
      </div>

      {/* Quick log FAB */}
      <QuickLogSheet />

      {/* Kick counter toast */}
      {showKickToast && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 rounded-full bg-accent px-5 py-2.5 text-[13px] font-semibold text-white shadow-card animate-fade-up">
          {t("home.kicks.logged")}
        </div>
      )}

      {/* Pet Picker Modal */}
      <PetPickerModal open={petPickerOpen} onClose={() => setPetPickerOpen(false)} />
    </div>
  );
}
