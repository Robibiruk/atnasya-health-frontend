// BottomNav — role-based tabs: 5 for tracker, 2 for partner.
import { NavLink } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const trackerTabs: Array<{ to: string; label: string; path: string; primary?: boolean }> = [
  { to: "/", label: "Home", path: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" },
  { to: "/cycle", label: "Cycle", path: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { to: "/log", label: "Log", primary: true, path: "M12 4v16m8-8H4" },
  { to: "/selfcare", label: "Selfcare", path: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" },
  { to: "/profile", label: "Profile", path: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
];

const partnerTabs: Array<{ to: string; label: string; path: string }> = [
  { to: "/partner-dashboard", label: "Overview", path: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" },
  { to: "/partner-calendar", label: "Calendar", path: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { to: "/partner-support", label: "Support", path: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" },
];

export function BottomNav() {
  const role = useAuthStore((s) => s.role);
  const isPartner = role === "partner";
  const tabs = isPartner ? partnerTabs : trackerTabs;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[480px] md:max-w-[640px] h-16 border-t border-border bg-card">
      <div className={`flex h-full items-center ${isPartner ? "divide-x divide-border" : "justify-around"}`}>
        {tabs.map(({ to, label, path, primary }: { to: string; label: string; path: string; primary?: boolean }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors duration-200 ${
                isPartner ? "flex-1 h-full" : "px-2 py-1"
              } ${
                primary ? "" : isActive ? "text-primary" : "text-muted"
              }`
            }
          >
            {({ isActive }) =>
              primary ? (
                <div className="flex h-12 w-12 -translate-y-4 items-center justify-center rounded-full bg-accent shadow-card">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={path} />
                  </svg>
                </div>
              ) : (
                <>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={path} />
                  </svg>
                  <span className="text-[10px] font-semibold">{label}</span>
                </>
              )
            }
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
