// App — router, theme, auth gate, screen transitions, role-based routing.
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useAuthStore } from "./store/authStore";
import { BottomNav } from "./components/layout/BottomNav";
import { Login } from "./pages/Login";
import { CyclePage } from "./pages/Cycle";
import { Log } from "./pages/Log";
import { Selfcare } from "./pages/Selfcare";
import { Profile } from "./pages/Profile";
import { PartnerView } from "./pages/PartnerView";
import { PartnerDashboard } from "./pages/PartnerDashboard";
import { PartnerCalendar } from "./pages/PartnerCalendar";
import { PartnerSupport } from "./pages/PartnerSupport";
import { PartnerProfile } from "./pages/PartnerProfile";
import { Onboarding } from "./pages/Onboarding";
import { OnboardGate } from "./pages/OnboardGate";
import { SecretChat } from "./components/secret/SecretChat";
import { PWAInstallBanner } from "./components/ui/PWAInstallBanner";
import { Spinner } from "./components/ui/Spinner";
// Styles are imported in main.tsx via ./styles/index.css which imports global.css + tailwind

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

// Tracker-only route: redirects partners to partner-dashboard
function TrackerRoute({ children }: { children: React.ReactNode }) {
  const role = useAuthStore((s) => s.role);
  if (role === "partner") return <Navigate to="/partner-dashboard" replace />;
  return <>{children}</>;
}

// Partner-only route: redirects trackers to home
function PartnerOnlyRoute({ children }: { children: React.ReactNode }) {
  const role = useAuthStore((s) => s.role);
  if (role === "tracker") return <Navigate to="/" replace />;
  return <>{children}</>;
}

// Profile route: shows tracker or partner profile based on role
function ProfileRoute() {
  const role = useAuthStore((s) => s.role);
  if (role === "partner") return <PartnerProfile />;
  return <Profile />;
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

// Animated page wrapper with screen transitions
function AnimatedRoutes() {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState<"in" | "out">("in");

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setTransitionStage("out");
    }
  }, [location, displayLocation]);

  const handleAnimationEnd = () => {
    if (transitionStage === "out") {
      setDisplayLocation(location);
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
        <Route
          path="/onboarding"
          element={
            <Protected>
              <Onboarding />
            </Protected>
          }
        />
        <Route
          path="/"
          element={
            <Protected>
              <OnboardGate />
            </Protected>
          }
        />

        {/* Tracker-only routes */}
        <Route
          path="/cycle"
          element={
            <Protected>
              <TrackerRoute>
                <Layout>
                  <CyclePage />
                </Layout>
              </TrackerRoute>
            </Protected>
          }
        />
        <Route
          path="/log"
          element={
            <Protected>
              <TrackerRoute>
                <Layout>
                  <Log />
                </Layout>
              </TrackerRoute>
            </Protected>
          }
        />
        <Route
          path="/selfcare"
          element={
            <Protected>
              <TrackerRoute>
                <Layout>
                  <Selfcare />
                </Layout>
              </TrackerRoute>
            </Protected>
          }
        />
        <Route
          path="/secret"
          element={
            <Protected>
              <TrackerRoute>
                <Layout>
                  <SecretPage />
                </Layout>
              </TrackerRoute>
            </Protected>
          }
        />

        {/* Profile — role-specific */}
        <Route
          path="/profile"
          element={
            <Protected>
              <Layout>
                <ProfileRoute />
              </Layout>
            </Protected>
          }
        />
        <Route
          path="/partner-profile"
          element={
            <Protected>
              <PartnerOnlyRoute>
                <PartnerProfile />
              </PartnerOnlyRoute>
            </Protected>
          }
        />

        {/* Partner routes — Layout provides BottomNav (with 3-tab partner nav) */}
        <Route
          path="/partner-dashboard"
          element={
            <Protected>
              <Layout>
                <PartnerDashboard />
              </Layout>
            </Protected>
          }
        />
        <Route
          path="/partner-calendar"
          element={
            <Protected>
              <Layout>
                <PartnerCalendar />
              </Layout>
            </Protected>
          }
        />
        <Route
          path="/partner-support"
          element={
            <Protected>
              <Layout>
                <PartnerSupport />
              </Layout>
            </Protected>
          }
        />
        <Route
          path="/partner-profile"
          element={
            <Protected>
              <Layout>
                <PartnerOnlyRoute>
                  <PartnerProfile />
                </PartnerOnlyRoute>
              </Layout>
            </Protected>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      {children}
      <BottomNav />
    </div>
  );
}

export default function App() {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const favicon = useAuthStore((s) => s.favicon);

  useEffect(() => {
    const next = favicon ? `/favicon/${favicon}.png` : "/favicon/1.png";

    const faviconLink =
      typeof document !== "undefined"
        ? document.querySelector<HTMLLinkElement>('head link[rel="icon"][type="image/png"]')
        : null;
    const appleLink =
      typeof document !== "undefined"
        ? document.querySelector<HTMLLinkElement>('head link[rel="apple-touch-icon"]')
        : null;

    if (faviconLink && faviconLink.getAttribute("href") !== next) {
      faviconLink.setAttribute("href", next);
    }
    if (appleLink && appleLink.getAttribute("href") !== next) {
      appleLink.setAttribute("href", next);
    }
  }, [favicon]);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    try {
      unsub = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
      });
    } catch {
      setLoading(false);
    }
    const timeout = setTimeout(() => setLoading(false), 3000);
    return () => {
      if (unsub) unsub();
      clearTimeout(timeout);
    };
  }, [setUser, setLoading]);

  return (
    <BrowserRouter>
      <PWAInstallBanner />
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
