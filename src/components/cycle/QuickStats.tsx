// QuickStats — 2×2 grid of real cycle statistics.
import { motion } from "framer-motion";
import { useCycleStore } from "../../store/cycleStore";
import { useAuthStore } from "../../store/authStore";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import type { ApiResponse } from "../../types";

interface CycleStats {
  avgCycleLength: number | null;
  avgPeriodDuration: number | null;
  daysLogged: number;
  currentStreak: number;
  trackingSince: string | null;
}

const METRICS = [
  { key: "avgCycleLength", label: "Avg cycle", suffix: "d", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", color: "var(--color-primary)" },
  { key: "avgPeriodDuration", label: "Avg period", suffix: "d", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z", color: "var(--color-accent)" },
  { key: "daysLogged", label: "Cycles logged", suffix: "", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", color: "var(--color-fertile)" },
  { key: "currentStreak", label: "Streak", suffix: "", icon: "M13 10V3L4 14h7v7l9-11h-7z", color: "var(--color-pms)" },
];

export function QuickStats() {
  const cycles = useCycleStore((s) => s.cycles);
  const onboardingData = useAuthStore((s) => s.onboarding);
  const prediction = useCycleStore((s) => s.prediction);
  const [stats, setStats] = useState<CycleStats | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get<ApiResponse<CycleStats>>("/cycles/stats");
        if (res.data.success) setStats(res.data.data);
      } catch {
        // Fall back to computing from local cycles
        const lengths = cycles.map((c) => c.cycleLength).filter((l): l is number => !!l && l >= 21 && l <= 45);
        const durations = cycles.filter((c) => c.periodEnd).map((c) => {
          const days = Math.round((new Date(c.periodEnd!).getTime() - new Date(c.periodStart).getTime()) / 86400000) + 1;
          return days;
        });
        setStats({
          avgCycleLength: lengths.length > 0 ? Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length) : (onboardingData?.cycleLength ?? null),
          avgPeriodDuration: durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : (onboardingData?.periodLength ?? null),
          daysLogged: cycles.length,
          currentStreak: cycles.length,
          trackingSince: cycles.length > 0 ? cycles[cycles.length - 1]?.periodStart ?? null : null,
        });
      }
    };
    load();
  }, [cycles, onboardingData]);

  const getStatValue = (key: string): string => {
    if (!stats) return "—";
    switch (key) {
      case "avgCycleLength":
        return stats.avgCycleLength != null ? `${stats.avgCycleLength}` : "—";
      case "avgPeriodDuration":
        return stats.avgPeriodDuration != null ? `${stats.avgPeriodDuration}` : "—";
      case "daysLogged":
        return stats.daysLogged > 0 ? `${stats.daysLogged}` : "—";
      case "currentStreak":
        return stats.currentStreak > 0 ? `${stats.currentStreak}d 🔥` : "—d";
      default:
        return "—";
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {METRICS.map((m, i) => (
        <motion.div
          key={m.key}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 + i * 0.08, duration: 0.3 }}
          className="relative overflow-hidden rounded-card bg-card shadow-card p-4"
        >
          <svg
            className="absolute top-3 left-3 opacity-20"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke={m.color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={m.icon} />
          </svg>
          <div className="pt-5">
            <p className="text-[24px] font-bold text-text leading-tight">
              {getStatValue(m.key)}{m.suffix}
            </p>
            <p className="text-[12px] text-muted mt-0.5">{m.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
