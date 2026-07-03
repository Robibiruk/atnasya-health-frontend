// useInsights hook — fetch today's insight cards.
import { useCallback, useState } from "react";
import { api } from "../lib/api";
import type { ApiResponse, InsightEntry } from "../types";

export function useInsights() {
  const [insight, setInsight] = useState<InsightEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchToday = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiResponse<InsightEntry | null>>(
        "/insights/today"
      );
      if (res.data.success) setInsight(res.data.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load insights");
    } finally {
      setLoading(false);
    }
  }, []);

  const generate = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.post<ApiResponse<InsightEntry | null>>(
        "/insights/generate"
      );
      if (res.data.success) setInsight(res.data.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }, []);

  return { insight, loading, error, fetchToday, generate };
}
