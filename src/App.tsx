// App — router, theme, auth gate.
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { auth } from "./lib/firebase";
import { useAuthStore } from "./store/authStore";
import { AIChatFAB } from "./components/ai/AIChatFAB";
import { BottomNav } from "./components/layout/BottomNav";
import { Login } from "./pages/Login";
import { CyclePage } from "./pages/Cycle";
import { Log } from "./pages/Log";
import { Selfcare } from "./pages/Selfcare";
import { Profile } from "./pages/Profile";
import { PartnerDashboard } from "./pages/PartnerDashboard";
import { PartnerCalendar } from "./pages/PartnerCalendar";
import { PartnerSupport } from "./pages/PartnerSupport";
import { PartnerProfile } from "./pages/PartnerProfile";
import { Onboarding } from "./pages/Onboarding";
import { OnboardGate } from "./pages/OnboardGate";
import { SecretChat } from "./components/secret/SecretChat";
import { PWAInstallBanner } from "./components/ui/PWAInstallBanner";
import { Spinner } from "./components/ui/Spinner";

function Protected({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <Spinner />
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function TrackerOnly({ children }: { children: React.ReactNode }) {
  const role = useAuthStore((s) => s.role);
  const loading = useAuthStore((s) => s.loading);
  if (loading || role === "partner") return <Navigate to="/partner-dashboard" replace />;
  return <>{children}</>;
}

function PartnerOnly({ children }: { children: React.ReactNode }) {
  const role = useAuthStore((s) => s.role);
  const loading = useAuthStore((s) => s.loading);
  if (loading || role === "tracker") return <Navigate to="/" replace />;
  return <>{children}</>;
}

function ProfileRoute() {
  const role = useAuthStore((s) => s.role);
  if (role === "partner") return <PartnerProfile />;
  return <Profile />;
}

function AnimatedRoutes() {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState<"in" | "out">("in");
  const locationRef = useRef(location);
  locationRef.current = location;

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setTransitionStage("out");
    }
  }, [location.pathname, displayLocation.pathname]);

  const handleAnimationEnd = () => {
    if (transitionStage === "out") {
      setDisplayLocation(locationRef.current);
      setTransitionStage("in");
    }
  };

  return (
    <div
      className="min-h-screen bg-surface"
      style={{
        animation:
          transitionStage === "in"
            ? "screenIn 0.25s ease-out forwards"
            : "screenOut 0.15s ease-out forwards",
      }}
      onAnimationEnd={handleAnimationEnd}
    >
      <Routes location={displayLocation}>
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Protected><Onboarding /></Protected>} />
        <Route path="/" element={<Protected><OnboardGate /></Protected>} />
        <Route path="/cycle" element={<Protected><TrackerOnly><Layout><CyclePage /></Layout></TrackerOnly></Protected>} />
        <Route path="/log" element={<Protected><TrackerOnly><Layout><Log /></Layout></TrackerOnly></Protected>} />
        <Route path="/selfcare" element={<Protected><TrackerOnly><Layout><Selfcare /></Layout></TrackerOnly></Protected>} />
        <Route path="/secret" element={<Protected><TrackerOnly><Layout><SecretPage /></Layout></TrackerOnly></Protected>} />
        <Route path="/profile" element={<Protected><Layout><ProfileRoute /></Layout></Protected>} />
        <Route path="/partner-profile" element={<Protected><PartnerOnly><PartnerProfile /></PartnerOnly></Protected>} />
        <Route path="/partner-dashboard" element={<Protected><Layout><PartnerDashboard /></Layout></Protected>} />
        <Route path="/partner-calendar" element={<Protected><Layout><PartnerCalendar /></Layout></Protected>} />
        <Route path="/partner-support" element={<Protected><Layout><PartnerSupport /></Layout></Protected>} />
        <Route path="*" element={<Protected><Layout><OnboardGate /></Layout></Protected>} />
      </Routes>
    </div>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface pb-16">
      {children}
    </div>
  );
}

function SecretPage() {
  return (
    <div className="pb-24">
      <div className="px-5 pt-4">
        <SecretChat />
      </div>
    </div>
  );
}

export default function App() {
  const favicon = useAuthStore((s) => s.favicon);

  useEffect(() => {
    const base = favicon ? `/favicon/${favicon}.png` : "/favicon/1.png";
    const next = `${base}?v=${encodeURIComponent(favicon ?? "1")}`;
    const faviconLink = document.querySelector<HTMLLinkElement>('head link[rel="icon"][type="image/png"]');
    const appleLink = document.querySelector<HTMLLinkElement>('head link[rel="apple-touch-icon"]');

    if (faviconLink) faviconLink.setAttribute("href", next);
    if (appleLink) appleLink.setAttribute("href", next);
  }, [favicon]);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppInner />
    </BrowserRouter>
  );
}

function AppInner() {
  const location = useLocation();
  return (
    <>
      <AuthInit />
      <BottomNav />
      <AIChatFAB />
      <AnimatedRoutes />
    </>
  );
}

function AuthInit() {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const init = async () => {
      try {
        const current = auth.currentUser;
        if (current) {
          if (!cancelled) setUser(current);
        } else {
          await new Promise<void>((resolve) => {
            const unsub = auth.onAuthStateChanged((user) => {
              if (cancelled) {
                unsub();
                resolve();
                return;
              }
              setUser(user);
              setLoading(false);
              resolve();
            });
          });
          return;
        }
      } catch {
        // ignore restore errors; app falls back to loading state
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [setUser, setLoading]);

  return null;
}
