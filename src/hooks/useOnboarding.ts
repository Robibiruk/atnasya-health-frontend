// useOnboarding hook — save onboarding data + reset tracking data.
import { useCallback } from "react";
import { api } from "../lib/api";
import { useAuthStore } from "../store/authStore";
import { useCycleStore } from "../store/cycleStore";
import type { ApiResponse, NotificationPrefs } from "../types";

export interface OnboardingData {
  goal: "track" | "conceive" | "avoid" | "wellness" | "understand";
  periodStart: string | null;
  periodLength: number;
  cycleLength: number;
  birthYear: number;
  pregnant: boolean | null;
  notificationPrefs: NotificationPrefs;
}

export function useOnboarding() {
  const setOnboarding = useAuthStore((s) => s.setOnboarding);
  const setInitialCycle = useCycleStore((s) => s.setInitialCycle);
  const setCycles = useCycleStore((s) => s.setCycles);

  const completeOnboarding = useCallback(
    async (data: OnboardingData) => {
      // 1. Create the first cycle document
      let CycleEntry = null;
      if (data.periodStart) {
        const c = await api.post<
          ApiResponse<{
            _id: string;
            userId: string;
            periodStart: string;
            periodEnd: string | null;
            cycleLength: number | null;
            ovulationDate: string | null;
            notes: string | null;
            createdAt: string;
          }>
        >("/cycles", {
          periodStart: data.periodStart,
          notes: data.pregnant === true ? "Pregnancy tracking" : undefined,
        });
        if (c.data.success) {
          CycleEntry = c.data.data;
        }
      }

      // 2. Persist onboarding data to user document
      await api.put("/auth/settings", {
        onboardingCompleted: true,
        goal: data.goal,
        birthYear: data.birthYear,
        notificationPrefs: data.notificationPrefs,
        onboarding: {
          periodLength: data.periodLength,
          cycleLength: data.cycleLength,
          pregnant: data.pregnant,
        },
      });

      // 3. Update Zustand store
      if (CycleEntry) {
        setInitialCycle(CycleEntry);
      }
      setOnboarding({
        onboardingCompleted: true,
        goal: data.goal,
        birthYear: data.birthYear,
        notificationPrefs: data.notificationPrefs,
        onboarding: {
          periodLength: data.periodLength,
          cycleLength: data.cycleLength,
          pregnant: data.pregnant,
        },
      });
    },
    [setInitialCycle, setOnboarding]
  );

  const resetTracking = useCallback(async () => {
    // 1. Delete all cycles
    await api.delete("/cycles").catch(() => {});

    // 2. Reset onboarding flag on backend
    await api.put("/auth/settings", { onboardingCompleted: false }).catch(() => {});

    // 3. Clear Zustand stores
    setCycles([]);
    useAuthStore.getState().resetOnboarding();
  }, [setCycles]);

  return { completeOnboarding, resetTracking };
}
