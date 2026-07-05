// OnboardGate — gates the Home route: redirects to /onboarding for new users,
// or to /partner-dashboard for partners.
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useCycleStore } from "../store/cycleStore";
import { Home } from "../pages/Home";
import { Spinner } from "../components/ui/Spinner";

export function OnboardGate() {
  const loading = useAuthStore((s) => s.loading);
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const onboardingCompleted = useAuthStore((s) => s.onboardingCompleted);
  const cycles = useCycleStore((s) => s.cycles);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Partners always go to partner-dashboard
  if (role === "partner") {
    return <Navigate to="/partner-dashboard" replace />;
  }

  if (!onboardingCompleted && cycles.length === 0) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Home />;
}
