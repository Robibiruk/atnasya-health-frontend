// PartnerCalendar — shared calendar view with phase coloring, appointments, pregnancy milestones.
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { usePartner, type PartnerView } from "../hooks/usePartner";
import { Spinner } from "../components/ui/Spinner";
import { phaseColor } from "../lib/cycleUtils";
import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function daysInMonth(y: number, m: number) { return new Date(y, m, 0).getDate(); }
function startOffset(y: number, m: number) { return new Date(y, m - 1, 1).getDay(); }
function phaseBg(phase: string): string {
  switch (phase) {
    case "menstrual": return "rgba(232,121,160,0.25)";
    case "fertile": return "rgba(16,185,129,0.2)";
    case "ovulation": return "rgba(245,158,11,0.25)";
    case "luteal": return "rgba(245,158,11,0.1)";
    case "follicular": return "rgba(96,165,250,0.12)";
    default: return "transparent";
  }
}
function phaseBorder(phase: string): string {
  switch (phase) {
    case "menstrual": return "rgba(232,121,160,0.5)";
    case "fertile": return "rgba(16,185,129,0.4)";
    case "ovulation": return "rgba(245,158,11,0.5)";
    default: return "transparent";
  }
}

export function PartnerCalendar() {
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const { partnerView, fetchPartnerView } = usePartner();
  const [data, setData] = useState<PartnerView | null>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    if (!user) return;
    fetchPartnerView().then((r) => { if (r) setData(r); setLoading(false); });
  }, [user, fetchPartnerView]);

  if (role === "tracker") return <Navigate to="/" replace />;
  if (!user) return <Navigate to="/login" replace />;

  if (loading) return <div className="pb-24 px-5 pt-5"><Spinner /></div>;
  if (!data) return <div className="pb-24 px-5 pt-5 text-center text-muted">Not connected yet. Go to Overview to enter a code.</div>;

  const phaseColorValue = phaseColor(data.currentPhase as any);
  const total = daysInMonth(year, month);
  const offset = startOffset(year, month);
  const today = new Date().toISOString().slice(0, 10);
  const monthName = new Date(year, month - 1, 1).toLocaleString("en-US", { month: "long" });

  const prediction = (data as any).prediction ?? null;

  const goPrev = () => { const d = new Date(year, month - 2, 1); setYear(d.getFullYear()); setMonth(d.getMonth() + 1); };
  const goNext = () => { const d = new Date(year, month, 1); setYear(d.getFullYear()); setMonth(d.getMonth() + 1); };

  // Build phase-colored days based on prediction
  const days: Array<{ day: number; iso: string; phase: string; isToday: boolean }> = [];
  for (let d = 1; d <= total; d++) {
    const iso = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    let phase = "unknown";
    if (prediction) {
      // Simple phase lookup by date proximity
      const dateObj = new Date(iso);
      const pNext = new Date(prediction.nextPeriod);
      const pFertileStart = new Date(prediction.fertileStart);
      const pFertileEnd = new Date(prediction.fertileEnd);
      const pOvu = new Date(prediction.ovulationDay);
      if (dateObj.toDateString() === pOvu.toDateString()) phase = "ovulation";
      else if (dateObj >= pFertileStart && dateObj <= pFertileEnd) phase = "fertile";
      else if (dateObj >= pNext) phase = "menstrual"; // predicted period start
    }
    days.push({ day: d, iso, phase, isToday: iso === today });
  }

  return (
    <div className="pb-24">
      <div className="px-5 pt-5 pb-2">
        <h1 className="text-[20px] font-bold text-text">Shared calendar</h1>
        <p className="text-[12px] text-muted">{data.ownerFirstName}'s cycle phases</p>
      </div>
      <div className="px-5 pt-2 space-y-4">
        {/* Mini calendar */}
        <div className="rounded-card bg-card shadow-card p-4">
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={goPrev} className="flex h-9 w-9 items-center justify-center rounded-full cursor-pointer text-muted hover:bg-card-hover"><ChevronLeft className="h-4 w-4" /></button>
            <h3 className="text-[15px] font-bold text-text">{monthName} {year}</h3>
            <button type="button" onClick={goNext} className="flex h-9 w-9 items-center justify-center rounded-full cursor-pointer text-muted hover:bg-card-hover"><ChevronRight className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {WEEKDAYS.map((w, i) => <div key={i} className="text-[10px] font-semibold text-muted uppercase py-1">{w}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: offset }).map((_, i) => <div key={`e-${i}`} className="h-9 w-full" />)}
            {days.map((d) => (
              <div key={d.iso} className={`flex h-9 w-full items-center justify-center rounded-full text-[12px] font-medium ${d.isToday ? "ring-2 ring-primary" : ""}`}
                style={{ backgroundColor: d.phase !== "unknown" ? phaseBg(d.phase) : "transparent", color: d.phase !== "unknown" ? (d.isToday ? "var(--color-primary)" : "var(--color-text)") : "var(--color-muted)", border: d.phase !== "unknown" && phaseBorder(d.phase) !== "transparent" ? `1px solid ${phaseBorder(d.phase)}` : "none" }}>
                {d.day}
              </div>
            ))}
          </div>
          {/* Legend */}
          <div className="flex gap-3 mt-3 pt-3 border-t border-border">
            {[{ label: "Period", color: "rgba(232,121,160,0.25)" }, { label: "Fertile", color: "rgba(16,185,129,0.2)" }, { label: "Ovulation", color: "rgba(245,158,11,0.25)" }].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: l.color }} /><span className="text-[10px] text-muted">{l.label}</span></div>
            ))}
          </div>
        </div>

        {/* Upcoming dates */}
        <div className="rounded-card bg-card shadow-card p-4 space-y-3">
          <p className="text-[13px] font-semibold text-text">Upcoming</p>
          {data.daysUntilPeriod <= 10 && (
            <div className="flex items-center gap-3">
              <span className="text-[18px]">🌸</span>
              <div><p className="text-[13px] font-semibold text-text">Period</p><p className="text-[11px] text-muted">{data.daysUntilPeriod === 0 ? "Today" : `In ${data.daysUntilPeriod} days`}</p></div>
            </div>
          )}
          {(data as any).dueDate && (
            <div className="flex items-center gap-3">
              <span className="text-[18px]">🤰</span>
              <div><p className="text-[13px] font-semibold text-text">Due date</p><p className="text-[11px] text-muted">{(data as any).dueDate}</p></div>
            </div>
          )}
          {data.nextEvents.filter((e) => e.daysUntil <= 10).map((ev, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-[18px]">📌</span>
              <div><p className="text-[13px] font-semibold text-text">{ev.name}</p><p className="text-[11px] text-muted">{ev.daysUntil === 0 ? "Today" : `In ${ev.daysUntil} days`}</p></div>
            </div>
          ))}
        </div>

        {/* Prediction info */}
        {prediction && (
          <div className="rounded-card bg-card shadow-card p-4 space-y-2">
            <p className="text-[12px] font-semibold text-muted uppercase tracking-wide">Predictions</p>
            <div className="flex justify-between text-[13px]"><span className="text-text">Next period</span><span className="font-semibold" style={{ color: phaseColorValue }}>{new Date(prediction.nextPeriod).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span></div>
            <div className="flex justify-between text-[13px]"><span className="text-text">Fertile window</span><span className="text-muted">{new Date(prediction.fertileStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })} – {new Date(prediction.fertileEnd).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span></div>
            <div className="flex justify-between text-[13px]"><span className="text-text">Ovulation</span><span className="text-muted">{new Date(prediction.ovulationDay).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span></div>
          </div>
        )}
      </div>
    </div>
  );
}
