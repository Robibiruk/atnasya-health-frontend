// Cycle page — dark-stage calendar + period logging + cycle ring + stats + prediction accuracy + charts + pregnancy mode.
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TopBar } from "../components/layout/TopBar";
import { CycleCalendarGrid } from "../components/cycle/CycleCalendarGrid";
import { CycleRingSVG } from "../components/cycle/CycleRingSVG";
import { DayDetailPanel } from "../components/cycle/DayDetailPanel";
import { PeriodLogSheet } from "../components/cycle/PeriodLogSheet";
import { QuickStats } from "../components/cycle/QuickStats";
import { PregnancyWidget } from "../components/cycle/PregnancyWidget";
import { QuickLogSheet } from "../components/layout/QuickLogSheet";
import { useCycle } from "../hooks/useCycle";
import { useCycleStore } from "../store/cycleStore";
import { useAuthStore } from "../store/authStore";
import { Spinner } from "../components/ui/Spinner";
import { api } from "../lib/api";
import type { SymptomEntry, ApiResponse, PredictionAccuracy } from "../types";

// ========== SVG ICONS ==========
function ChartIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>;
}
function HeatmapIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
}
function TargetIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
}

// ========== PREDICTION ACCURACY VIEW ==========
function PredictionAccuracyView({ cycles }: { cycles: Array<{ periodStart: string; cycleLength: number | null }> }) {
  if (cycles.length < 2) {
    return <p className="text-[13px] text-muted text-center py-3">Need at least 2 cycles to show prediction accuracy.</p>;
  }

  const accuracyData: PredictionAccuracy[] = [];
  for (let i = 1; i < cycles.length; i++) {
    const predictedDate = cycles[i - 1].periodStart
      ? new Date(new Date(cycles[i - 1].periodStart).getTime() + (cycles[i - 1].cycleLength ?? 28) * 86400000).toISOString().slice(0, 10)
      : null;
    const actualDate = cycles[i].periodStart;
    if (predictedDate && actualDate) {
      const diffDays = Math.round((new Date(actualDate).getTime() - new Date(predictedDate).getTime()) / 86400000);
      accuracyData.push({
        predictedDate,
        actualDate,
        diffDays,
        cycleLabel: `Cycle ${i} → ${i + 1}`,
      });
    }
  }

  if (!accuracyData.length) return null;

  const avgDiff = accuracyData.reduce((s, a) => s + Math.abs(a.diffDays), 0) / accuracyData.length;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 mb-2">
        <TargetIcon />
        <span className="text-[13px] font-semibold text-text">Prediction accuracy</span>
        <span className="ml-auto text-[11px] text-muted">Avg off by {avgDiff.toFixed(1)}d</span>
      </div>
      {accuracyData.slice(-5).reverse().map((d, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-[10px] text-muted w-[60px] flex-shrink-0">{d.cycleLabel}</span>
          <div className="flex-1 h-6 rounded-full bg-card-hover relative overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(5, 100 - Math.abs(d.diffDays) * 10)}%` }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="h-full rounded-full"
              style={{
                marginLeft: d.diffDays > 0 ? `${Math.min(d.diffDays * 5, 45)}%` : 0,
                backgroundColor: Math.abs(d.diffDays) <= 1 ? "var(--color-success)" : Math.abs(d.diffDays) <= 3 ? "var(--color-accent)" : "var(--color-danger)",
              }}
            />
          </div>
          <span className="text-[10px] font-medium text-muted w-[30px] text-right">{d.diffDays > 0 ? `+${d.diffDays}` : `${d.diffDays}`}</span>
        </div>
      ))}
    </div>
  );
}

// ========== MOOD TREND CHART (SIMPLIFIED) ==========
function MoodTrendChart({ entries }: { entries: Array<{ date: string; mood: number | null }> }) {
  const valid = entries.filter((e) => e.mood !== null).slice(-30);
  if (valid.length < 2) {
    return <p className="text-[13px] text-muted text-center py-3">Log more moods to see trends.</p>;
  }

  const maxMood = 5;
  const chartH = 100;
  const barW = Math.min(16, Math.floor(300 / valid.length));

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <ChartIcon />
        <span className="text-[13px] font-semibold text-text">Mood trend (last {valid.length} days)</span>
      </div>
      <div className="flex items-end gap-0.5 h-[100px]" style={{ minHeight: chartH }}>
        {valid.map((e, i) => {
          const h = ((e.mood ?? 3) / maxMood) * chartH;
          return (
            <div key={i} className="flex flex-col items-center flex-1">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: h }}
                transition={{ duration: 0.4, delay: i * 0.02 }}
                className="w-full rounded-t-sm"
                style={{
                  backgroundColor: (e.mood ?? 3) >= 4 ? "var(--color-success)" : (e.mood ?? 3) >= 3 ? "var(--color-accent)" : "var(--color-period)",
                  opacity: 0.7 + (e.mood ?? 3) / 20,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ========== PAIN HEATMAP (SIMPLIFIED) ==========
function PainHeatmap({ symptoms }: { symptoms: SymptomEntry[] }) {
  const painSymptoms = symptoms.filter((s) => s.items.some((i) => ["cramps", "back pain", "headache"].includes(i.name.toLowerCase())));
  if (!painSymptoms.length) {
    return <p className="text-[13px] text-muted text-center py-3">Log pain symptoms to see your heatmap.</p>;
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <HeatmapIcon />
        <span className="text-[13px] font-semibold text-text">Pain heatmap</span>
      </div>
      {painSymptoms.slice(-10).map((s) => (
        <div key={s.date} className="flex items-center gap-2 py-1">
          <span className="text-[10px] text-muted w-[70px]">{new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
          <div className="flex gap-1">
            {s.items.filter((i) => ["cramps", "back pain", "headache"].includes(i.name.toLowerCase())).map((item, j) => (
              <span
                key={j}
                className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{
                  backgroundColor: item.intensity >= 4 ? "rgba(239,68,68,0.2)" : item.intensity >= 2 ? "rgba(251,146,60,0.2)" : "rgba(234,179,8,0.2)",
                  color: item.intensity >= 4 ? "#EF4444" : item.intensity >= 2 ? "#FB923C" : "#EAB308",
                }}
              >
                {item.name} {item.intensity}/5
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ========== SLEEP/ENERGY CHART ==========
function SleepEnergyChart({ entries }: { entries: Array<{ date: string; sleep: number | null; energy: number | null }> }) {
  const valid = entries.filter((e => e.sleep !== null && e.energy !== null)).slice(-14);
  if (valid.length < 2) {
    return <p className="text-[13px] text-muted text-center py-3">Log sleep and energy for 2+ days to see correlation.</p>;
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <ChartIcon />
        <span className="text-[13px] font-semibold text-text">Sleep vs Energy</span>
      </div>
      <div className="space-y-1.5">
        {valid.map((e) => (
          <div key={e.date} className="flex items-center gap-2">
            <span className="text-[10px] text-muted w-[65px]">{new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
            <div className="flex-1 flex items-center gap-1">
              {/* Sleep bar */}
              <div className="flex-1 h-3 rounded-full bg-indigo-500/10 relative overflow-hidden">
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${(e.sleep ?? 7) / 12 * 100}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full rounded-full bg-indigo-500/50"
                />
              </div>
              <span className="text-[10px] text-indigo-500 w-[20px]">{e.sleep}h</span>
              {/* Energy bar */}
              <div className="flex-1 h-3 rounded-full bg-accent/10 relative overflow-hidden">
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${(e.energy ?? 3) / 5 * 100}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full rounded-full bg-accent/50"
                />
              </div>
              <span className="text-[10px] text-accent w-[16px]">{e.energy}/5</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ========== MAIN PAGE ==========
export function CyclePage() {
  const { cycles, phaseMap, loggedDates, fetchCycles, fetchPrediction, buildPhaseMap, logPeriod } = useCycle();
  const prediction = useCycleStore((s) => s.prediction);
  const lastPeriodStart = useCycleStore((s) => s.cycles[0]?.periodStart ?? null);
  const currentPhase = useCycleStore((s) => s.currentPhase);
  const dayOfCycle = useCycleStore((s) => s.dayOfCycle);
  const onboardingData = useAuthStore((s) => s.onboarding);
  const goal = useAuthStore((s) => s.goal);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [periodSheetOpen, setPeriodSheetOpen] = useState(false);
  const [symptomList, setSymptomList] = useState<SymptomEntry[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selfcareEntries, setSelfcareEntries] = useState<Array<{ date: string; mood: number | null; sleep: number | null; energy: number | null }>>([]);

  const isPregnancyMode = goal === "track" && onboardingData?.pregnant === true;
  const pregnancyWeek = isPregnancyMode ? Math.min(40, Math.max(4, Math.floor(((dayOfCycle ?? 1) / 28) * 40))) : 0;
  const mockDueDate = isPregnancyMode
    ? new Date(Date.now() + (280 - pregnancyWeek * 7) * 86400000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "";

  const cycleLength = prediction?.avgLength ?? onboardingData?.cycleLength ?? 28;
  const periodDuration = onboardingData?.periodLength ?? 5;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [fetchedCycles] = await Promise.all([fetchCycles(), fetchPrediction()]);
      if (fetchedCycles) {
        buildPhaseMap(fetchedCycles);
      } else {
        buildPhaseMap();
      }
      try {
        const res = await api.get<ApiResponse<SymptomEntry[]>>("/symptoms?limit=90");
        if (res.data.success) setSymptomList(res.data.data);
      } catch { /* ignore */ }
      // Load selfcare for charts
      try {
        const res = await api.get<ApiResponse<Array<{ date: string; mood: number | null; sleep: number | null; energy: number | null }>>>("/selfcare?limit=90");
        if (res.data.success) setSelfcareEntries(res.data.data);
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, [fetchPrediction, fetchCycles]);

  const handleSelectDay = (date: string) => {
    setSelectedDate(date === selectedDate ? null : date);
  };

  const handleMonthChange = (y: number, m: number) => {
    setYear(y);
    setMonth(m);
    setSelectedDate(null);
  };

  const handleSavePeriod = async (startDate: string, duration: number) => {
    const start = new Date(startDate);
    const endDate = new Date(start.getTime() + (duration - 1) * 86400000);
    await logPeriod(startDate, endDate.toISOString().slice(0, 10));
    showToast("Period logged ✓");
  };

  const selectedSymptoms = selectedDate
    ? symptomList.find((s) => s.date === selectedDate) ?? null
    : null;

  if (loading) {
    return (
      <div className="pb-24">
        <TopBar />
        <div className="px-5 pt-4"><Spinner /></div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <TopBar />
      <div className="space-y-5 px-5 pt-3">
        {/* Pregnancy mode */}
        {isPregnancyMode && (
          <PregnancyWidget week={pregnancyWeek} dueDate={mockDueDate} onLogKick={() => showToast("Kicks logged ✓")} />
        )}

        {/* Cycle ring */}
        <CycleRingSVG />

        {/* Calendar grid */}
        <div className="relative">
          <CycleCalendarGrid
            phaseMap={phaseMap}
            loggedDates={loggedDates}
            year={year}
            month={month}
            selectedDate={selectedDate}
            onSelectDay={handleSelectDay}
            onChangeMonth={handleMonthChange}
          />
          {selectedDate && (
            <DayDetailPanel
              date={selectedDate}
              lastPeriodStart={lastPeriodStart}
              cycleLength={cycleLength}
              periodDuration={periodDuration}
              symptoms={selectedSymptoms}
              onClose={() => setSelectedDate(null)}
              onLogNow={() => setSelectedDate(null)}
            />
          )}
        </div>

        {/* Log period button */}
        <button
          type="button"
          onClick={() => setPeriodSheetOpen(true)}
          className="w-full rounded-btn border-2 px-5 py-3.5 text-[15px] font-semibold cursor-pointer transition-colors duration-150 hover:opacity-80"
          style={{ borderColor: "var(--color-period)", color: "var(--color-period)", backgroundColor: "transparent" }}
        >
          When did your last period start?
        </button>

        {/* Quick stats */}
        <QuickStats />

        {/* Analytics toggle */}
        {symptomList.length > 0 && (
          <button
            type="button"
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="w-full flex items-center justify-between rounded-btn bg-card-hover px-4 py-3 text-[14px] font-semibold text-text cursor-pointer hover:bg-card transition-colors"
          >
            <span>📊 Analytics & trends</span>
            <span className="text-[11px] text-muted">{showAnalytics ? "Hide" : "Show"}</span>
          </button>
        )}

        {showAnalytics && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {/* Prediction accuracy */}
            <PredictionAccuracyView cycles={cycles} />

            {/* Mood trend */}
            <MoodTrendChart entries={selfcareEntries.map((e) => ({ date: e.date, mood: e.mood }))} />

            {/* Pain heatmap */}
            <PainHeatmap symptoms={symptomList} />

            {/* Sleep/Energy correlation */}
            <SleepEnergyChart entries={selfcareEntries} />
          </motion.div>
        )}

        {/* Recent cycles */}
        <div>
          <h3 className="mb-3 text-[15px] font-bold text-text">Recent cycles</h3>
          {cycles.length === 0 ? (
            <p className="text-[14px] text-muted">No cycles logged yet.</p>
          ) : (
            <div className="space-y-2">
              {cycles.slice(0, 6).map((c) => {
                const dur = c.periodEnd
                  ? Math.round((new Date(c.periodEnd).getTime() - new Date(c.periodStart).getTime()) / 86400000) + 1
                  : null;
                return (
                  <div key={c._id} className="flex items-center justify-between rounded-btn bg-card-hover px-3 py-2.5 text-[14px]">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: "#E879A0" }} />
                      <span className="text-text">
                        {new Date(c.periodStart).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                    <span className="text-muted font-medium">{dur ? `${dur}d` : "—"}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <QuickLogSheet />
      <PeriodLogSheet open={periodSheetOpen} onClose={() => setPeriodSheetOpen(false)} onSave={handleSavePeriod} defaultDuration={periodDuration} />

      {toast && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 rounded-full bg-[var(--color-success)] px-5 py-2.5 text-[13px] font-semibold text-white shadow-card animate-fade-up">
          {toast}
        </div>
      )}
    </div>
  );
}
