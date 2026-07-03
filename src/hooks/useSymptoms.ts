// useSymptoms hook — fetch/mutate symptoms.
import { useCallback, useState } from "react";
import { api } from "../lib/api";
import type { ApiResponse, SymptomEntry } from "../types";

export function useSymptoms() {
  const [symptoms, setSymptoms] = useState<SymptomEntry[]>([]);
  const [patterns, setPatterns] = useState<
    Array<{ name: string; occurrences: number; avgIntensity: number }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSymptoms = useCallback(async (limit = 30) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiResponse<SymptomEntry[]>>(
        `/symptoms?limit=${limit}`
      );
      if (res.data.success) setSymptoms(res.data.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load symptoms");
    } finally {
      setLoading(false);
    }
  }, []);

  const logSymptoms = useCallback(
    async (date: string, items: Array<{ name: string; intensity: number }>) => {
      const res = await api.post<ApiResponse<SymptomEntry>>("/symptoms", {
        date,
        items,
      });
      return res.data;
    },
    []
  );

  const fetchPatterns = useCallback(async () => {
    const res = await api.get<
      ApiResponse<Array<{ name: string; occurrences: number; avgIntensity: number }>>
    >("/symptoms/patterns");
    if (res.data.success) setPatterns(res.data.data);
  }, []);

  return { symptoms, patterns, loading, error, fetchSymptoms, logSymptoms, fetchPatterns };
}
