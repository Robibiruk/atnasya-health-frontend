// useMood hook — fetch/mutate mood.
import { useCallback, useState } from "react";
import { api } from "../lib/api";
import type { ApiResponse, MoodEntry } from "../types";

export function useMood() {
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [heatmap, setHeatmap] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMoods = useCallback(async (limit = 30) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiResponse<MoodEntry[]>>(`/moods?limit=${limit}`);
      if (res.data.success) setMoods(res.data.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load moods");
    } finally {
      setLoading(false);
    }
  }, []);

  const logMood = useCallback(
    async (payload: { date: string; score: number; emoji: string; note?: string }) => {
      const res = await api.post<ApiResponse<MoodEntry>>("/moods", payload);
      return res.data;
    },
    []
  );

  const fetchHeatmap = useCallback(async () => {
    const res = await api.get<ApiResponse<MoodEntry[]>>("/moods/heatmap");
    if (res.data.success) setHeatmap(res.data.data);
  }, []);

  return { moods, heatmap, loading, error, fetchMoods, logMood, fetchHeatmap };
}
