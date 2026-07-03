// Zustand store — authentication, user, theme, anonymous mode, onboarding.
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "firebase/auth";
import type {
  UserProfile,
  OnboardingGoal,
  NotificationPrefs,
} from "../types";

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  theme: "light" | "dark";
  anonymousMode: boolean;
  // Onboarding state
  onboardingCompleted: boolean;
  role: "tracker" | "partner";
  goal: OnboardingGoal;
  birthYear: number | null;
  onboarding: {
    periodLength: number | null;
    cycleLength: number | null;
    pregnant: boolean | null;
  };
  notificationPrefs: NotificationPrefs;
  // Actions
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  toggleTheme: () => void;
  setTheme: (theme: "light" | "dark") => void;
  toggleAnonymousMode: () => void;
  setOnboarding: (partial: Partial<{
    onboardingCompleted: boolean;
    role: "tracker" | "partner";
    goal: OnboardingGoal;
    birthYear: number | null;
    onboarding: { periodLength: number | null; cycleLength: number | null; pregnant: boolean | null };
    notificationPrefs: NotificationPrefs;
  }>) => void;
  resetOnboarding: () => void;
  logout: () => void;
}

function applyTheme(theme: "light" | "dark"): void {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", theme);
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      loading: true,
      theme:
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light",
      anonymousMode: false,
      // Onboarding defaults
      onboardingCompleted: false,
      role: "tracker",
      goal: "track",
      birthYear: null,
      onboarding: {
        periodLength: null,
        cycleLength: null,
        pregnant: null,
      },
      notificationPrefs: {
        periodReminders: true,
        ovulationAlerts: true,
        dailyLogReminder: false,
      },
      // Actions
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (loading) => set({ loading }),
      toggleTheme: () => {
        const next = get().theme === "light" ? "dark" : "light";
        applyTheme(next);
        set({ theme: next });
      },
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
      toggleAnonymousMode: () =>
        set((s) => ({ anonymousMode: !s.anonymousMode })),
      setOnboarding: (partial) =>
        set((s) => ({
          onboardingCompleted: partial.onboardingCompleted ?? s.onboardingCompleted,
          role: partial.role ?? s.role,
          goal: partial.goal ?? s.goal,
          birthYear: partial.birthYear !== undefined ? partial.birthYear : s.birthYear,
          onboarding: partial.onboarding
            ? { ...s.onboarding, ...partial.onboarding }
            : s.onboarding,
          notificationPrefs: partial.notificationPrefs
            ? { ...s.notificationPrefs, ...partial.notificationPrefs }
            : s.notificationPrefs,
        })),
      resetOnboarding: () =>
        set({
          onboardingCompleted: false,
          role: "tracker",
          goal: "track",
          birthYear: null,
          onboarding: { periodLength: null, cycleLength: null, pregnant: null },
          notificationPrefs: {
            periodReminders: true,
            ovulationAlerts: true,
            dailyLogReminder: false,
          },
        }),
      logout: () =>
        set({ user: null, profile: null, loading: false }),
    }),
    {
      name: "atnasya-auth",
      partialize: (state) => ({
        theme: state.theme,
        anonymousMode: state.anonymousMode,
        onboardingCompleted: state.onboardingCompleted,
        role: state.role,
        goal: state.goal,
        birthYear: state.birthYear,
        onboarding: state.onboarding,
        notificationPrefs: state.notificationPrefs,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme);
      },
    }
  )
);
