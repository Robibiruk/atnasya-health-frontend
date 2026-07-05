// useCycle hook — fetch/mutate cycle data.
import { useCallback, useRef, useState } from "react";
import { api } from "../lib/api";
import { useCycleStore } from "../store/cycleStore";
import { useAuthStore } from "../store/authStore";
import { getFullYearPhaseMap } from "../lib/cycleUtils";
import type {
  ApiResponse,
  CycleEntry,
  CyclePhase,
  PredictionResponse,
} from "../types";

export interface CycleStats {
  avgCycleLength: number | null;
  avgPeriodDuration: number | null;
  daysLogged: number;
  currentStreak: number;
  trackingSince: string | null;
}

export function useCycle() {
  const { cycles, setCycles, setInitialCycle, setPrediction, addCycle } =
    useCycleStore();
  const [phaseMap, setPhaseMap] = useState<Map<string, CyclePhase>>(new Map());
  const [loggedDates, setLoggedDates] = useState<Set<string>>(new Set());
  const cyclesRef = useRef(cycles);
  cyclesRef.current = cycles;

  const withUser = useCallback(async () => {
    const user = useAuthStore.getState().user;
    if (!user) return null;
    return useAuthStore.getState();
  }, []);

  const fetchCycles = useCallback(async () => {
    const state = await withUser();
    if (!state?.user) return null;
    const res = await api.get<ApiResponse<CycleEntry[]>>("/cycles");
    if (res.data.success) setCycles(res.data.data);
    return res.data.success ? res.data.data : null;
  }, [setCycles, withUser]);

  const fetchPrediction = useCallback(async () => {
    const state = await withUser();
    if (!state?.user) return null;
    const res =
      await api.get<ApiResponse<PredictionResponse>>("/cycles/predict");
    if (res.data.success) setPrediction(res.data.data);
    return res.data.success ? res.data.data : null;
  }, [setPrediction, withUser]);

  const fetchStats = useCallback(async () => {
    const state = await withUser();
    if (!state?.user) return null;
    const res = await api.get<ApiResponse<CycleStats>>("/cycles/stats");
    return res.data;
  }, [withUser]);

  // Build the client-side phase map from logged cycles + onboarding fallbacks
  const buildPhaseMap = useCallback((cycleInputs?: CycleEntry[]) => {
    const state = useAuthStore.getState();
    const avgCycleLength = state.onboarding?.cycleLength ?? 28;
    const avgPeriodDuration = state.onboarding?.periodLength ?? 5;

    const inputs = cycleInputs ?? cyclesRef.current;

    const mapped = inputs.map((c) => ({
      periodStart: c.periodStart,
      periodEnd: c.periodEnd,
      cycleLength: c.cycleLength,
    }));

    const result = getFullYearPhaseMap(
      mapped,
      avgCycleLength,
      avgPeriodDuration,
    );
    setPhaseMap(result.phaseMap);
    setLoggedDates(result.loggedDates);
  }, []); // No cycles dependency — uses ref

  // Refresh everything (cycles + prediction + phase map)
  const refresh = useCallback(async () => {
    const [fetchedCycles, fetchedPrediction] = await Promise.all([
      fetchCycles(),
      fetchPrediction(),
    ]);
    if (fetchedCycles) {
      buildPhaseMap(fetchedCycles);
    } else {
      buildPhaseMap();
    }
  }, [fetchCycles, fetchPrediction, buildPhaseMap]);

  const logPeriod = useCallback(
    async (periodStart: string, periodEnd?: string, notes?: string) => {
      const res = await api.post<ApiResponse<CycleEntry>>("/cycles", {
        periodStart,
        periodEnd,
        notes,
      });
      if (res.data.success) {
        // Refetch canonical cycles + prediction from backend to avoid stale duplicates
        await refresh();
      }
      return res.data;
    },
    [refresh],
  );

  const updatePeriod = useCallback(
    async (id: string, periodEnd?: string, notes?: string) => {
      const res = await api.put<ApiResponse<CycleEntry>>(`/cycles/${id}`, {
        periodEnd,
        notes,
      });
      if (res.data.success) {
        // Refetch canonical cycles + prediction + phase map from backend
        await refresh();
      }
      return res.data;
    },
    [refresh],
  );

  return {
    cycles,
    phaseMap,
    loggedDates,
    fetchCycles,
    fetchPrediction,
    fetchStats,
    buildPhaseMap,
    refresh,
    logPeriod,
    updatePeriod,
    setInitialCycle,
  };
}
