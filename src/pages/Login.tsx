// Login page — Flo-style plum/rose, Google + email, SVG icons.
import { useState } from "react";
import { Navigate } from "react-router-dom";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  getIdToken,
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { api } from "../lib/api";
import { useAuthStore } from "../store/authStore";

export function Login() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const theme = useAuthStore((s) => s.theme);
  const toggleTheme = useAuthStore((s) => s.toggleTheme);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Google sign-in only works on localhost (Firebase restriction)
  const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

  if (user) return <Navigate to="/" replace />;

  const registerBackend = async (firebaseUser: { uid: string; displayName?: string | null; email?: string | null }, fullName?: string) => {
    try {
      // Get the Firebase ID token to send to the backend
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const token = await getIdToken(currentUser);
      await api.post("/auth/register", { name: fullName, email: firebaseUser.email, token });
      const me = await api.get("/auth/me");
      if (me?.data?.success) {
        useAuthStore.getState().setProfile(me.data.data);
        // Sync onboarding state from backend — new users always start fresh
        const backendUser = me.data.data;
        useAuthStore.getState().setOnboarding({
          onboardingCompleted: backendUser.onboardingCompleted ?? false,
          role: backendUser.role ?? "tracker",
        });
      }
    } catch {
      // Registration backend call failed — user is still logged in via Firebase
    }
  };

  const handleGoogle = async () => {
    // Google sign-in requires localhost — Firebase blocks LAN IPs
    if (!isLocalhost) {
      setError("Google sign-in needs localhost. Use email sign-in or open http://localhost:5173");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      setUser(cred.user);
      await registerBackend(cred.user, cred.user.displayName ?? undefined);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("Cross-Origin") || msg.includes("popup") || msg.includes("channel")) {
        setError("Popup blocked — allow popups for this site and try again");
      } else {
        setError(msg.includes("unauthorized-domain")
          ? "Google sign-in needs localhost. Use email or open http://localhost:5173"
          : "Google sign-in failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = async () => {
    if (!email || !password) { setError("Email and password are required"); return; }
    if (isSignUp && !name.trim()) { setError("Please enter your name"); return; }
    setLoading(true);
    setError(null);
    try {
      const cred = isSignUp
        ? await createUserWithEmailAndPassword(auth, email, password)
        : await signInWithEmailAndPassword(auth, email, password);
      setUser(cred.user);
      await registerBackend(cred.user, name.trim() || undefined);
    } catch {
      setError(isSignUp ? "Could not create account. The email may be in use." : "Incorrect email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col px-6 py-10 bg-surface">
      {/* Theme toggle */}
      <div className="mb-auto flex justify-end">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card cursor-pointer transition-colors duration-150 hover:bg-card-hover"
        >
          {theme === "dark" ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          )}
        </button>
      </div>

      {/* Branding */}
      <div className="flex flex-col items-center text-center animate-fade-up">
        {/* Flower SVG icon */}
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none" className="mb-3">
          <circle cx="28" cy="28" r="24" fill="var(--color-primary)" opacity="0.12" />
          <path d="M28 14c0 0 10 6 10 14s-10 14-10 14-10-6-10-14 10-14 10-14z" fill="var(--color-accent)" opacity="0.7" />
          <path d="M28 20c0 0 6 4 6 8s-6 8-6 8-6-4-6-8 6-8 6-8z" fill="var(--color-primary)" opacity="0.9" />
          <circle cx="28" cy="28" r="3" fill="white" />
        </svg>
        <h1 className="text-[28px] font-bold text-primary" style={{ fontFamily: "DM Serif Display, serif" }}>
          Atnasya Health
        </h1>
        <p className="mt-2 text-[14px] text-muted max-w-[260px]">
          Your private health companion, made with love by Robel.
        </p>
      </div>

      {/* Sign-in / Sign-up form */}
      <div className="mt-10 space-y-3">
        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-btn bg-card border border-border px-5 py-3.5 text-[15px] font-semibold text-text cursor-pointer transition-colors duration-200 hover:bg-card-hover disabled:opacity-50"
        >
          <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-2 text-muted">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[12px]">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {isSignUp && (
          <div>
            <label htmlFor="signup-name" className="sr-only">Your name</label>
            <input
              id="signup-name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-btn border border-border bg-card px-4 py-3 text-[15px] text-text outline-none focus:border-primary transition-colors duration-150"
            />
          </div>
        )}
        <div>
          <label htmlFor="email-input" className="sr-only">Email</label>
          <input
            id="email-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="off"
            className="w-full rounded-btn border border-border bg-card px-4 py-3 text-[15px] text-text outline-none focus:border-primary transition-colors duration-150"
          />
        </div>
        <div>
          <label htmlFor="password-input" className="sr-only">Password</label>
          <input
            id="password-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="w-full rounded-btn border border-border bg-card px-4 py-3 text-[15px] text-text outline-none focus:border-primary transition-colors duration-150"
          />
        </div>

        <button
          type="button"
          onClick={handleEmail}
          disabled={loading}
          aria-busy={loading ? "true" : "false"}
          className="w-full rounded-btn bg-primary text-white px-5 py-3.5 text-[15px] font-semibold cursor-pointer transition-colors duration-200 hover:bg-primary-light disabled:opacity-50"
        >
          {loading ? "Signing in..." : isSignUp ? "Create account" : "Sign in with email"}
        </button>

        {error && <p role="alert" aria-live="polite" className="text-center text-[13px] text-danger">{error}</p>}

        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full text-center text-[13px] text-muted underline cursor-pointer"
        >
          {isSignUp ? "Already have an account? Sign in" : "New here? Create an account"}
        </button>
      </div>

      <p className="mt-8 text-center text-[11px] text-subtle">
        Private · No ads · No data selling
      </p>
    </div>
  );
}
