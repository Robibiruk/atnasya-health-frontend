// Shared auth helpers for frontend.
import { auth } from "./firebase";
import { api } from "./api";
import { useAuthStore } from "../store/authStore";
import { getIdToken } from "firebase/auth";

export async function ensureAnonymousSession() {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      useAuthStore.getState().setUser(currentUser);
      return currentUser;
    }
    const { signInAnonymously } = await import("firebase/auth");
    const cred = await signInAnonymously(auth);
    useAuthStore.getState().setUser(cred.user);
    return cred.user;
  } catch {
    return null;
  }
}

export async function registerBackend(
  firebaseUser: { uid: string; displayName?: string | null; email?: string | null },
  fullName?: string
) {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    const token = await currentUser.getIdToken();
    const displayName = fullName || firebaseUser.displayName || firebaseUser.email?.split("@")[0];
    await api.post("/auth/register", {
      name: displayName || undefined,
      email: firebaseUser.email,
      token,
    });
    const me = await api.get("/auth/me");
    if (me?.data?.success) {
      useAuthStore.getState().setProfile(me.data.data);
      const backendUser = me.data.data;
      useAuthStore.getState().setOnboarding({
        onboardingCompleted: backendUser.onboardingCompleted ?? false,
        role: backendUser.role ?? "tracker",
      });
    }
  } catch {
    // ignore backend registration failures; Firebase auth still succeeds
  }
}
