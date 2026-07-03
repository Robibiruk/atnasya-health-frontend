// TopBar — greeting + bell icon + phase chip.
import { useAuthStore } from "../../store/authStore";
import { useCycleStore } from "../../store/cycleStore";
import { ThemeToggle } from "../ui/ThemeToggle";
import { PhaseChip } from "../cycle/PhaseChip";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function dateSubtitle(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function TopBar() {
  const user = useAuthStore((s) => s.user);
  const anonymousMode = useAuthStore((s) => s.anonymousMode);
  const profile = useAuthStore((s) => s.profile);
  const phase = useCycleStore((s) => s.currentPhase);
  const dayOfCycle = useCycleStore((s) => s.dayOfCycle);

  const name = anonymousMode
    ? "friend"
    : profile?.name || user?.displayName || "Atnasya";

  return (
    <div className="flex items-start justify-between px-5 pt-5 pb-2">
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-muted">{dateSubtitle()}</p>
        <h1 className="text-[22px] font-bold text-text leading-tight truncate">
          {greeting()}, {name}
        </h1>
        {phase !== "unknown" && (
          <div className="mt-2">
            <PhaseChip phase={phase} dayOfCycle={dayOfCycle} />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 ml-3 flex-shrink-0">
        {/* Bell icon */}
        <button
          type="button"
          aria-label="Notifications"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card cursor-pointer transition-colors duration-150 hover:bg-card-hover"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-muted)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
        </button>
        <ThemeToggle />
      </div>
    </div>
  );
}
