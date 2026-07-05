// Login — simple entry screen. Authenticated users never stay here.
import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../lib/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  EmailAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  linkWithCredential,
  signInAnonymously,
} from "firebase/auth";
import { useAuthStore } from "../store/authStore";
import { registerBackend } from "../lib/auth";
import { api } from "../lib/api";

function isAuthTriggeredError(err: unknown): boolean {
  if (!err) return false;
  if (typeof err === "object") {
    const anyErr = err as any;
    if (typeof anyErr?.code === "string" && anyErr.code.startsWith("auth/")) return true;
    if (typeof anyErr?.name === "string" && anyErr.name.includes("Auth")) return true;
  }
  if (typeof err === "string") {
    return [
      "auth/",
      "popup-closed-by-user",
      "A listener indicated an asynchronous response by returning true",
      "operation is not allowed",
    ].some((s) => err.includes(s));
  }
  return false;
}

export function Login() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const location = useLocation();
  const mountedRef = useRef(true);

  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    mountedRef.current = true;
    const onUnhandled = (e: PromiseRejectionEvent) => {
      if (isAuthTriggeredError(e.reason)) e.preventDefault();
    };
    window.addEventListener("unhandledrejection", onUnhandled);
    return () => {
      mountedRef.current = false;
      window.removeEventListener("unhandledrejection", onUnhandled);
    };
  }, []);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((current) => {
      if (!mountedRef.current) return;
      if (current) useAuthStore.getState().setUser(current);
      setIsReady(true);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const state = location.state as { syncMode?: string } | null;
    if (state?.syncMode === "email") {
      setIsSignUp(true);
    }
  }, [location.state]);

  const startAnonymous = async () => {
    setLoading(true);
    setError(null);
    try {
      const existing = auth.currentUser;
      if (existing) {
        useAuthStore.getState().setUser(existing);
        await registerBackend(existing);
      } else {
        const cred = await signInAnonymously(auth);
        useAuthStore.getState().setUser(cred.user);
        await registerBackend(cred.user);
      }
    } catch (err) {
      if (!isAuthTriggeredError(err)) setError(err instanceof Error ? err.message : "Could not continue without signing in");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const current = auth.currentUser;
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      if (current?.isAnonymous && fbUser.email) {
        const cred = GoogleAuthProvider.credentialFromResult(result);
        if (cred) {
          try {
            await linkWithCredential(current, cred);
          } catch {
            // ignore link failures, already signed in with google
          }
        }
        try {
          await current.reload();
        } catch {
          // fallback if reload fails
        }
        const updated = auth.currentUser ?? current;
        await registerBackend(updated);
        useAuthStore.getState().setUser(updated);
      } else {
        await registerBackend(fbUser);
        useAuthStore.getState().setUser(fbUser);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg.includes("popup-closed-by-user") ? "Sign-in popup closed" : "Could not sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = async () => {
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }
    if (isSignUp && !fullName.trim()) {
      setError("Please add your name");
      return;
    }
    if (isSignUp && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const current = auth.currentUser;
      let fbUser;
      if (current?.isAnonymous) {
        const credential = EmailAuthProvider.credential(email, password);
        await linkWithCredential(current, credential);
        try {
          await current.reload();
        } catch {
          // reload may fail if user state changed
        }
        const linked = auth.currentUser ?? current;
        fbUser = linked;
      } else {
        const cred = isSignUp
          ? await createUserWithEmailAndPassword(auth, email, password)
          : await signInWithEmailAndPassword(auth, email, password);
        fbUser = cred.user;
      }
      await registerBackend(fbUser);
      if (isSignUp && fullName.trim()) {
        try {
          await api.put("/auth/profile", { name: fullName.trim(), email });
        } catch {
          // non-blocking
        }
      }
      useAuthStore.getState().setUser(fbUser);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const friendly = isSignUp
        ? (msg.includes("EMAIL_EXISTS")
            ? "An account with this email already exists. Try signing in instead."
            : msg.includes("WEAK_PASSWORD")
              ? "Password is too weak. Use at least 6 characters."
              : msg.includes("INVALID_EMAIL")
                ? "Please enter a valid email."
                : "Could not create account. Please try again.")
        : `${msg}`;
      setError(friendly);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      {user ? (
        <Navigate to="/" replace />
      ) : (
        <div className="w-full max-w-sm space-y-4 rounded-card border border-border bg-card p-6 shadow-card">
          <div>
            <h1 className="text-[18px] font-bold text-text">Welcome</h1>
            <p className="text-[13px] text-muted">Continue without signing in, or create an account to sync your data.</p>
          </div>
          <div className="space-y-2">
            <button type="button" onClick={startAnonymous} disabled={loading} className="w-full rounded-btn border border-border bg-card px-5 py-3 text-[15px] font-semibold text-text cursor-pointer hover:bg-card-hover transition-colors disabled:opacity-50">
              Continue without signing in
            </button>
            <button type="button" onClick={handleGoogle} disabled={loading} className="flex w-full items-center justify-center gap-3 rounded-btn bg-card border border-border px-5 py-3 text-[15px] font-semibold text-text cursor-pointer hover:bg-card-hover transition-colors disabled:opacity-50">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Sign in with Google
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              <button type="button" onClick={() => { setIsSignUp(false); setError(null); }} className={`flex-1 rounded-btn px-5 py-3 text-[15px] font-semibold cursor-pointer transition-colors border ${!isSignUp ? 'bg-primary border-primary text-white' : 'bg-card border-border text-text hover:bg-card-hover'} disabled:opacity-50`}>
                Sign in with email
              </button>
              <button type="button" onClick={() => { setIsSignUp(true); setError(null); }} className={`flex-1 rounded-btn px-5 py-3 text-[15px] font-semibold cursor-pointer transition-colors border ${isSignUp ? 'bg-primary border-primary text-white' : 'bg-card border-border text-text hover:bg-card-hover'} disabled:opacity-50`}>
                Create account
              </button>
            </div>

            <div className="space-y-3 pt-2 border-t border-border">
              <input id="email" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-btn border border-border bg-card px-4 py-3 text-[15px] text-text outline-none focus:border-primary" />
              <input id="password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-btn border border-border bg-card px-4 py-3 text-[15px] text-text outline-none focus:border-primary" />
              {isSignUp && (
                <>
                  <input id="name" type="text" placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full rounded-btn border border-border bg-card px-4 py-3 text-[15px] text-text outline-none focus:border-primary" />
                  <input id="confirm" type="password" placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full rounded-btn border border-border bg-card px-4 py-3 text-[15px] text-text outline-none focus:border-primary" />
                </>
              )}
              <button type="button" onClick={handleEmail} disabled={loading} className="w-full rounded-btn bg-primary text-white px-5 py-3.5 text-[15px] font-semibold cursor-pointer transition-colors hover:bg-primary-light disabled:opacity-50">
                {loading ? "Please wait..." : (isSignUp ? "Create account" : "Sign in")}
              </button>
            </div>
          </div>

          {error && <p className="text-center text-[13px] text-danger">{error}</p>}
        </div>
      )}
    </div>
  );
}
