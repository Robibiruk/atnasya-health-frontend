// useVitals hook — fetch/mutate vitals.
import { useCallback, useState } from "react";
import { api } from "../lib/api";
import type { ApiResponse, VitalEntry } from "../types";

interface VitalTrendPoint {
  date: string;
  systolic: number | null;
  diastolic: number | null;
  sugar: number | null;
  weight: number | null;
  phase?: string;
}

export function useVitals() {
  const [vitals, setVitals] = useState<VitalEntry[]>([]);
  const [trends, setTrends] = useState<VitalTrendPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVitals = useCallback(async (limit = 30) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiResponse<VitalEntry[]>>(
        `/vitals?limit=${limit}`
      );
      if (res.data.success) setVitals(res.data.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load vitals");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTrends = useCallback(async (days = 7) => {
    const res = await api.get<ApiResponse<VitalTrendPoint[]>>(
      `/vitals/trends?days=${days}`
    );
    if (res.data.success) setTrends(res.data.data);
  }, []);

  const logVitals = useCallback(
    async (payload: Partial<VitalEntry>) => {
      const res = await api.post<ApiResponse<VitalEntry>>("/vitals", payload);
      return res.data;
    },
    []
  );

  return { vitals, trends, loading, error, fetchVitals, fetchTrends, logVitals };
}
