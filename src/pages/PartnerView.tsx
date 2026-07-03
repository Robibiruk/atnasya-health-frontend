// PartnerView — read-only dashboard for the partner to see owner's cycle info.
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { usePartner } from "../hooks/usePartner";
import { useAuthStore } from "../store/authStore";
import { EmpathyTipCard } from "../components/partner/EmpathyTipCard";
import { Spinner } from "../components/ui/Spinner";
import { phaseColor } from "../lib/cycleUtils";

export function PartnerView() {
  const { partnerView, fetchPartnerView, loading } = usePartner();
  const user = useAuthStore((s) => s.user);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const hasAccess = await fetchPartnerView();
      if (!hasAccess) setAccessDenied(true);
    };
    load();
  }, [user, fetchPartnerView]);

  if (!user) return <Navigate to="/login" replace />;
  if (accessDenied) return <Navigate to="/" replace />;
  if (loading && !partnerView) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <Spinner />
      </div>
    );
  }
  if (!partnerView) return null;

  const phaseColorValue = phaseColor(
    partnerView.currentPhase as "menstrual" | "follicular" | "fertile" | "ovulation" | "luteal" | "unknown"
  );

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <h1 className="text-[20px] font-bold text-text">
          {partnerView.ownerFirstName}&apos;s cycle
        </h1>
        <div className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span className="text-[11px] font-medium text-muted">Private</span>
        </div>
      </div>

      <div className="space-y-5 px-5 pt-3">
        {/* Phase hero */}
        <div className="dark-stage p-6 text-center space-y-3">
          <p
            className="text-[32px] font-bold capitalize"
            style={{ color: phaseColorValue }}
          >
            {partnerView.currentPhase.replace("_", " ")} Phase
          </p>
          <p className="text-[14px] text-muted">Day {partnerView.dayOfCycle} of cycle</p>
          <div className="flex justify-center">
            <span
              className="inline-flex items-center rounded-full px-4 py-1.5 text-[13px] font-semibold text-white"
              style={{ backgroundColor: phaseColorValue }}
            >
              {partnerView.daysUntilPeriod === 0
                ? "Period today"
                : `Period in ${partnerView.daysUntilPeriod}d`}
            </span>
          </div>
        </div>

        {/* Upcoming events */}
        {partnerView.nextEvents.length > 0 && (
          <div>
            <h3 className="text-[14px] font-semibold text-text mb-3">Upcoming</h3>
            <div className="flex gap-3 overflow-x-auto no-scrollbar">
              {partnerView.nextEvents.slice(0, 2).map((ev, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 rounded-full px-4 py-2 border text-[13px] font-semibold"
                  style={{
                    borderColor: phaseColorValue,
                    color: phaseColorValue,
                    backgroundColor: `color-mix(in srgb, ${phaseColorValue} 10%, var(--color-card))`,
                  }}
                >
                  {ev.name} · in {ev.daysUntil}d
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empathy tip */}
        <EmpathyTipCard tip={partnerView.empathyTip} />

        {/* Mood (if shared) */}
        {partnerView.moodSummary && (
          <div className="rounded-card bg-card shadow-card p-4">
            <p className="text-[12px] font-semibold text-muted mb-2">How she&apos;s feeling</p>
            <p className="text-[15px] text-text">{partnerView.moodSummary}</p>
          </div>
        )}

        {/* Privacy footer */}
        <p className="text-center text-[11px] text-subtle leading-relaxed pt-4">
          🔒 {partnerView.ownerFirstName} controls exactly what you see.
          <br />
          Symptoms and health details are always private.
        </p>
      </div>
    </div>
  );
}
