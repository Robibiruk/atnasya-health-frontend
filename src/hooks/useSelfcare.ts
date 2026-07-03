// Selfcare hook — fetch/mutate self-care data.
import { useCallback, useRef, useState } from "react";
import { api } from "../lib/api";
import { useSelfcareStore } from "../store/selfcareStore";
import { useAuthStore } from "../store/authStore";
import { getFullYearSelfcareMap } from "../lib/selfcareUtils";
import type {
  ApiResponse,
  SelfcareEntry,
  SelfcareCard,
  SelfcareSummary,
} from "../types";

export interface SelfcareStats {
  totalEntries: number;
  streaks: {
    mood: number;
    water: number;
    sleep: number;
  };
  averages: {};
}

export function useSelfcare() {
  const {
    selfcareEntries,
    setSelfcareEntries,
    setInitialSelfcare,
    addSelfcareEntry,
  } = useSelfcareStore();
  const [selfcareMap, setSelfcareMap] = useState<Map<string, SelfcareCard>>(
    new Map(),
  );
  const [selfcareSummary, setSelfcareSummary] =
    useState<SelfcareSummary | null>(null);
  const [loggedDates, setLoggedDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  // Use ref to track selfcareEntries for buildSelfcareMap without causing re-renders
  const selfcareEntriesRef = useRef(selfcareEntries);
  selfcareEntriesRef.current = selfcareEntries;

  const fetchSelfcare = useCallback(async () => {
    setLoading(true);
    const res = await api.get<ApiResponse<SelfcareEntry[]>>("/selfcare");
    if (res.data.success) setSelfcareEntries(res.data.data);
    setLoading(false);
    return res.data;
  }, [setSelfcareEntries]);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    const res =
      await api.get<ApiResponse<SelfcareSummary>>("/selfcare/summary");
    if (res.data.success) setSelfcareSummary(res.data.data);
    setLoading(false);
    return res.data;
  }, [setSelfcareSummary]);

  const fetchStats = useCallback(async () => {
    const res = await api.get<ApiResponse<SelfcareStats>>("/selfcare/stats");
    return res.data;
  }, []);

  // Build the client-side self-care map from logged self-care + onboarding fallbacks
  const buildSelfcareMap = useCallback(() => {
    const state = useAuthStore.getState();
    const selfcareEntries = selfcareEntriesRef.current;

    const selfcareInputs = selfcareEntries.map((e) => ({
      date: e.date,
      mood: e.mood,
      water: e.water,
      sleep: e.sleep,
      energy: e.energy,
      notes: e.notes,
    }));

    const result = getFullYearSelfcareMap(selfcareInputs);
    setSelfcareMap(result.selfcareMap);
    setLoggedDates(result.loggedDates);
    setSelfcareSummary(result.summary);
  }, []); // No selfcareEntries dependency — uses ref

  // Refresh everything (selfcare + summary + selfcare map)
  const refresh = useCallback(async () => {
    await Promise.all([fetchSelfcare(), fetchSummary()]);
    buildSelfcareMap();
  }, [fetchSelfcare, fetchSummary, buildSelfcareMap]);

  const logSelfcare = useCallback(
    async (
      date: string,
      mood?: number,
      water?: number,
      sleep?: number,
      energy?: number,
      notes?: string,
    ) => {
      const res = await api.post<ApiResponse<SelfcareEntry>>("/selfcare", {
        date,
        mood,
        water,
        sleep,
        energy,
        notes,
      });
      if (res.data.success) {
        addSelfcareEntry(res.data.data);
        // Rebuild selfcare map after adding a new self-care entry
        buildSelfcareMap();
      }
      return res.data;
    },
    [addSelfcareEntry, buildSelfcareMap],
  );

  return {
    selfcareEntries,
    selfcareMap,
    selfcareSummary,
    loggedDates,
    fetchSelfcare,
    fetchSummary,
    fetchStats,
    buildSelfcareMap,
    refresh,
    logSelfcare,
    setInitialSelfcare,
    loading,
  };
}
