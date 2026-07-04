// Log page — symptom/vitals/mood logging hub with expanded options, daily log history,
// expandable daily summaries, and swipe-left edit/delete using react-swipeable-list.
import { useEffect, useRef, useState } from "react";
import { TopBar } from "../components/layout/TopBar";
import { BottomSheet } from "../components/ui/BottomSheet";
import { VitalLogger } from "../components/vitals/VitalLogger";
import { useVitals } from "../hooks/useVitals";
import { useSymptoms } from "../hooks/useSymptoms";
import { useMood } from "../hooks/useMood";
import { useSelfcare } from "../hooks/useSelfcare";
import { Spinner } from "../components/ui/Spinner";
import { api } from "../lib/api";
import type { IntimacyEntry, MedicationEntry } from "../types";

// ---------------------------------------------------------------------------
// Existing logging state + helpers
// ---------------------------------------------------------------------------
type Tab = "symptoms" | "vitals" | "mood" | "lifestyle" | "more";
const TABS: { key: Tab; label: string; emoji: string }[] = [
  { key: "symptoms", label: "Symptoms", emoji: "🌿" },
  { key: "vitals", label: "Vitals", emoji: "💗" },
  { key: "mood", label: "Mood", emoji: "😊" },
  { key: "lifestyle", label: "Lifestyle", emoji: "🌟" },
  { key: "more", label: "More", emoji: "➕" },
];

const FLOW_OPTIONS = ["Spotting", "Light", "Medium", "Heavy"] as const;
const MOOD_SCORES: { emoji: string; score: number; label: string }[] = [
  { emoji: "😄", score: 5, label: "great" },
  { emoji: "🙂", score: 4, label: "good" },
  { emoji: "😐", score: 3, label: "okay" },
  { emoji: "😔", score: 2, label: "low" },
  { emoji: "😢", score: 1, label: "bad" },
];
const SYMPTOM_OPTIONS = [
  "Cramps", "Bloating", "Headache", "Fatigue", "Tender", "Acne", "Nausea", "Back pain",
  "Dizziness", "Mood swings", "Insomnia", "Cravings",
];
const LIFESTYLE_OPTIONS = [
  { key: "intimacy", emoji: "💕", label: "Intimacy", desc: "Protected / unprotected" },
  { key: "water", emoji: "💧", label: "Water intake", desc: "How many glasses?" },
  { key: "sleep", emoji: "😴", label: "Sleep hours", desc: "How many hours?" },
  { key: "medication", emoji: "💊", label: "Medication", desc: "What did you take?" },
];
const COMMON_MEDS = ["Prenatal vitamin", "Iron supplement", "Vitamin D", "Magnesium", "Folate", "Aspirin", "Ibuprofen", "Acetaminophen"];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface DailyLogItem {
  _id?: string;
  date: string;
  summary: string;
  details: Record<string, unknown>;
}

function LeafIcon() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M40 8C40 8 56 20 56 36C56 52 40 60 40 60C40 60 24 52 24 36C24 20 40 8 40 8Z" fill="var(--color-accent-light)" opacity="0.3" />
      <path d="M40 16C40 16 52 26 52 38C52 50 40 56 40 56C40 56 28 50 28 38C28 26 40 16 40 16Z" fill="var(--color-accent)" opacity="0.5" />
      <path d="M40 28V56" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" />
      <path d="M40 36L32 30" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M40 42L48 36" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function Log() {
  // Existing logging state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [nestedSheet, setNestedSheet] = useState<{ type: string; data?: unknown } | null>(null);
  const [flow, setFlow] = useState<string | null>(null);
  const [mood, setMood] = useState<number | null>(null);
  const [symptoms, setSymptoms] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState("");
  const [tab, setTab] = useState<Tab>("symptoms");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const { logVitals } = useVitals();
  const { logSymptoms } = useSymptoms();
  const { logMood } = useMood();
  const { logSelfcare } = useSelfcare();
  const [intimacyProtected, setIntimacyProtected] = useState<boolean | null>(null);
  const [waterIntake, setWaterIntake] = useState(5);
  const [sleepHours, setSleepHours] = useState(7);
  const [medName, setMedName] = useState("");
  const [medDosage, setMedDosage] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedMedications, setSelectedMedications] = useState<Set<string>>(new Set());

  // Daily log history state
  const [dailyLogs, setDailyLogs] = useState<DailyLogItem[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<DailyLogItem | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const toggleSymptom = (name: string) => {
    setSymptoms((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };
  const toggleMedication = (name: string) => {
    setSelectedMedications((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };
  const showToastLocal = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  // ---------------------------------------------------------------------------
  // Persist today's daily log after logging actions
  // ---------------------------------------------------------------------------
  const persistDailyLog = async (summaryParts: string[]) => {
    const today = new Date().toISOString().slice(0, 10);
    const summary = summaryParts.filter(Boolean).join(" · ") || `Logged ${today}`;
    const details: Record<string, unknown> = {};
    if (symptoms.size > 0) details.symptoms = Array.from(symptoms);
    if (mood !== null) details.mood = { score: mood };
    if (flow) details.flow = flow;
    if (intimacyProtected !== null) details.intimacy = intimacyProtected;
    if (waterIntake) details.water = waterIntake;
    if (sleepHours) details.sleep = sleepHours;
    if (selectedMedications.size > 0) details.medications = Array.from(selectedMedications);
    if (medName) details.customMedication = { name: medName, dosage: medDosage };
    if (photoPreview) details.photos = [{ url: photoPreview, caption: notes || undefined }];
    if (notes) details.notes = notes;
    try {
      await api.post("/daily-logs", { date: today, summary, details });
      await fetchDailyLogs();
    } catch {
      // silent
    }
  };

  // ---------------------------------------------------------------------------
  // Fetch daily logs
  // ---------------------------------------------------------------------------
  const fetchDailyLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await api.get<{ success: boolean; data: DailyLogItem[] }>("/daily-logs");
      if (res.data.success) setDailyLogs(res.data.data ?? []);
    } finally {
      setLogsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Handle save from current logging sheet
  // ---------------------------------------------------------------------------
  const handleSave = async () => {
    setSaving(true);
    const today = new Date().toISOString().slice(0, 10);
    const summaryParts: string[] = [];
    if (mood !== null) {
      const emoji = mood >= 4 ? "😊" : mood >= 3 ? "😐" : "😔";
      await logMood({ date: today, score: mood, emoji });
      summaryParts.push("Mood");
    }
    if (symptoms.size > 0) {
      await logSymptoms(today, Array.from(symptoms).map((name) => ({ name, intensity: 3 })));
      summaryParts.push("Symptoms");
    }
    if (waterIntake > 0 || sleepHours > 0) {
      await logSelfcare(today, undefined, waterIntake || undefined, sleepHours || undefined, undefined, notes || undefined);
      summaryParts.push("Selfcare");
    }
    if (intimacyProtected !== null) {
      try { await api.post("/intimacy", { date: today, protected: intimacyProtected, notes: notes || undefined }); } catch { /* ignore */ }
      summaryParts.push("Intimacy");
    }
    if (selectedMedications.size > 0) {
      for (const name of selectedMedications) {
        try { await api.post("/medications", { date: today, name, dosage: medDosage || "as directed", time: new Date().toTimeString().slice(0, 5) }); } catch { /* ignore */ }
      }
      summaryParts.push("Medications");
    }
    if (medName) {
      try { await api.post("/medications", { date: today, name: medName, dosage: medDosage || "as directed", time: new Date().toTimeString().slice(0, 5) }); } catch { /* ignore */ }
      summaryParts.push("Medications");
    }
    if (photoPreview) {
      try { await api.post("/photos", { date: today, url: photoPreview, caption: notes || undefined }); } catch { /* ignore */ }
      summaryParts.push("Photo");
    }
    await persistDailyLog(summaryParts);
    setSaving(false);
    showToastLocal("Saved successfully");
    setSheetOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFlow(null);
    setMood(null);
    setSymptoms(new Set());
    setNotes("");
    setIntimacyProtected(null);
    setWaterIntake(5);
    setSleepHours(7);
    setMedName("");
    setMedDosage("");
    setPhotoFile(null);
    setPhotoPreview(null);
    setSelectedMedications(new Set());
    setNestedSheet(null);
  };

  const handlePhotoSelect = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setPhotoFile(file);
        const reader = new FileReader();
        reader.onload = () => setPhotoPreview(reader.result as string);
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // ---------------------------------------------------------------------------
  // Daily log list actions
  // ---------------------------------------------------------------------------
  const confirmDelete = async (date: string) => {
    try {
      await api.delete(`/daily-logs/${encodeURIComponent(date)}`);
      setDailyLogs((s) => s.filter((x) => x.date !== date));
      setShowDeleteConfirm(null);
    } catch {
      showToastLocal("Delete failed");
    }
  };

  const submitEdit = async () => {
    if (!editingItem) return;
    const date = editingItem.date;
    const summaryParts: string[] = [];
    if (mood !== null) summaryParts.push("Mood");
    if (symptoms.size > 0) summaryParts.push("Symptoms");
    if (waterIntake > 0 || sleepHours > 0) summaryParts.push("Selfcare");
    if (intimacyProtected !== null) summaryParts.push("Intimacy");
    if (selectedMedications.size > 0) summaryParts.push("Medications");
    if (medName) summaryParts.push("Medications");
    if (photoPreview) summaryParts.push("Photo");
    const summary = summaryParts.filter(Boolean).join(" · ") || `Logged ${date}`;
    const details: Record<string, unknown> = {};
    if (symptoms.size > 0) details.symptoms = Array.from(symptoms);
    if (mood !== null) details.mood = { score: mood };
    if (flow) details.flow = flow;
    if (intimacyProtected !== null) details.intimacy = intimacyProtected;
    if (waterIntake) details.water = waterIntake;
    if (sleepHours) details.sleep = sleepHours;
    if (selectedMedications.size > 0) details.medications = Array.from(selectedMedications);
    if (medName) details.customMedication = { name: medName, dosage: medDosage };
    if (photoPreview) details.photos = [{ url: photoPreview, caption: notes || undefined }];
    if (notes) details.notes = notes;
    try {
      const res = await api.patch<{ success: boolean; data: DailyLogItem }>(`/daily-logs/${encodeURIComponent(date)}`, { summary, details });
      if (res.data.success) {
        setDailyLogs((s) => s.map((x) => (x.date === date ? res.data.data : x)));
        setEditingItem(null);
        showToastLocal("Updated");
      }
    } catch { showToastLocal("Update failed"); }
  };

  // Prefill editing form when clicking edit
  useEffect(() => {
    if (!editingItem) return;
    const d = editingItem.details || {};
    setFlow((d.flow as string | undefined) ?? null);
    setMood((d.mood as { score: number } | undefined)?.score ?? null);
    setSymptoms(new Set(((d.symptoms as string[] | undefined) ?? [])));
    setNotes((d.notes as string | undefined) ?? "");
    setIntimacyProtected((d.intimacy as boolean | undefined) ?? null);
    setWaterIntake((d.water as number | undefined) ?? 5);
    setSleepHours((d.sleep as number | undefined) ?? 7);
    setSelectedMedications(new Set([...(d.medications as string[] | undefined ?? []), ...(d.customMedication ? [d.customMedication as any] : [])]));
    setMedName((d.customMedication as { name?: string } | undefined)?.name ?? "");
    setMedDosage((d.customMedication as { dosage?: string } | undefined)?.dosage ?? "");
    setPhotoPreview(/^https?:\/\//.test((d.photos as any)?.[0]?.url) ? ((d.photos as any)[0].url as string) : null);
    setPhotoFile(null);
  }, [editingItem]);

  useEffect(() => {
    fetchDailyLogs();
  }, []);

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------
  const renderDetails = (item: DailyLogItem) => {
    const d = item.details || {};
    const parts: string[] = [];
    const maybe = (v: unknown, label: string) => { if (v !== undefined && v !== null) parts.push(`${label}: ${JSON.stringify(v)}`); };
    maybe(d.symptoms, "Symptoms");
    maybe(d.mood, "Mood");
    maybe(d.flow, "Flow");
    maybe(d.intimacy, "Intimacy");
    maybe(d.water, "Water");
    maybe(d.sleep, "Sleep");
    maybe(d.medications, "Medications");
    maybe(d.customMedication, "Custom medication");
    maybe(d.notes, "Notes");
    return parts.length > 0 ? parts.join(" · ") : "No details";
  };

  const renderPhotos = (item: DailyLogItem) => {
    const photos = (item.details?.photos ?? []) as Array<{ url?: string }> | undefined;
    if (!photos?.length) return null;
    return (
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {photos.map((photo, idx) => (
          <img key={idx} src={photo?.url} alt="" className="h-28 w-40 rounded-xl object-cover border border-border bg-card" />
        ))}
      </div>
    );
  };

  return (
    <div className="pb-24">
      <TopBar />

      {/* Logging entry empty state */}
      {dailyLogs.length === 0 && !logsLoading && (
        <div className="flex flex-col items-center justify-center px-5 pt-16">
          <LeafIcon />
          <h2 className="mt-5 text-[18px] font-bold text-text">Log today</h2>
          <p className="mt-1 text-[14px] text-muted text-center max-w-[260px]">
            Track symptoms, vitals, mood, lifestyle, and more.
          </p>
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="mt-6 flex h-[60px] w-[60px] items-center justify-center rounded-full bg-primary shadow-card cursor-pointer transition-transform duration-200 hover:scale-105"
            aria-label="Log today"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      )}

      {/* Daily log history */}
      {dailyLogs.length > 0 && (
        <div className="px-5 pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-semibold uppercase tracking-wide text-muted">Your logs</p>
            <button type="button" onClick={() => setSheetOpen(true)} className="text-[12px] text-primary font-semibold cursor-pointer">+ New log</button>
          </div>
          {logsLoading ? (
            <div className="flex items-center justify-center py-10"><Spinner /></div>
          ) : (
            <div className="space-y-3">
              {dailyLogs.map((item) => {
                const expanded = expandedDate === item.date;
                const dateLabel = new Date(item.date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
                return (
                  <div key={item.date} className="rounded-card bg-card shadow-card border border-border">
                    <button type="button" className="w-full text-left" onClick={() => setExpandedDate(expanded ? null : item.date)}>
                      <div className="p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[14px] font-semibold text-text truncate">{item.summary || `Log on ${dateLabel}`}</p>
                            <p className="text-[12px] text-muted truncate">{renderDetails(item)}</p>
                          </div>
                          <span className="text-[11px] font-semibold text-muted uppercase tracking-wide whitespace-nowrap">{dateLabel}</span>
                        </div>
                      </div>
                    </button>

                    {expanded && (
                      <div className="px-4 pb-4 pt-0">
                        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
                          <p className="text-[12px] text-muted leading-relaxed">{renderDetails(item)}</p>
                          {renderPhotos(item)}
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => setEditingItem(item)} className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-[13px] font-semibold text-text cursor-pointer hover:bg-card-hover">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                              Edit
                            </button>
                            <button type="button" onClick={() => setShowDeleteConfirm(item.date)} className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-[13px] font-semibold text-danger cursor-pointer hover:bg-danger/10">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Main bottom sheet */}
      <BottomSheet open={sheetOpen} onClose={() => { if (!nestedSheet) setSheetOpen(false); else setNestedSheet(null); }} title={nestedSheet ? `Log ${nestedSheet.type}` : "Log today"}>
        {!nestedSheet ? (
          <>
            {/* Tabs */}
            <div className="flex gap-1 mb-4 overflow-x-auto no-scrollbar">
              {TABS.map((t) => (
                <button key={t.key} type="button" onClick={() => setTab(t.key)}
                  className={`flex-shrink-0 rounded-full px-4 py-1.5 text-[13px] font-semibold cursor-pointer transition-colors duration-150 ${tab === t.key ? "bg-primary text-white" : "bg-card-hover text-muted"}`}>
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>

            {tab === "symptoms" && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-[14px] font-semibold text-text mb-2">How's your flow?</h3>
                  <div className="flex gap-2">
                    {FLOW_OPTIONS.map((opt) => (
                      <button key={opt} type="button" onClick={() => setFlow(opt)}
                        className={`flex-1 rounded-btn px-3 py-2.5 text-[13px] font-medium cursor-pointer transition-all duration-80 ${flow === opt ? "bg-period text-white" : "border border-border bg-card text-muted hover:bg-card-hover"}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold text-text mb-2">Symptoms</h3>
                  <div className="flex flex-wrap gap-2">
                    {SYMPTOM_OPTIONS.map((name) => (
                      <button key={name} type="button" onClick={() => toggleSymptom(name)}
                        className={`rounded-full px-3.5 py-2 text-[13px] font-medium cursor-pointer transition-all duration-80 ${symptoms.has(name) ? "bg-primary text-white" : "border border-border text-muted hover:bg-card-hover"}`}>
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold text-text mb-2">Notes</h3>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything you want to remember..." rows={3}
                    className="w-full rounded-btn border border-border bg-card px-3 py-2.5 text-[14px] text-text outline-none focus:border-primary transition-colors duration-150" />
                </div>
              </div>
            )}

            {tab === "vitals" && (
              <VitalLogger onSave={async (payload) => { await logVitals(payload); showToastLocal("Vitals saved"); }} />
            )}

            {tab === "mood" && (
              <div className="space-y-5">
                <h3 className="text-[14px] font-semibold text-text">Your mood</h3>
                <div className="flex justify-between gap-2">
                  {MOOD_SCORES.map(({ emoji, score, label }) => (
                    <button key={label} type="button" onClick={() => setMood(score)}
                      className={`flex h-[52px] w-[52px] items-center justify-center rounded-full cursor-pointer transition-all duration-150 text-[24px] ${mood === score ? "bg-primary-light/20 ring-2 ring-primary scale-110" : "text-muted hover:bg-card-hover"}`}
                      aria-label={label}>{emoji}</button>
                  ))}
                </div>
                <p className="text-[12px] text-muted text-center">{mood !== null ? `Mood score: ${mood}/5` : "Tap a face to log your mood"}</p>
              </div>
            )}

            {tab === "lifestyle" && (
              <div className="space-y-3">
                <h3 className="text-[14px] font-semibold text-text mb-2">Lifestyle & habits</h3>
                {LIFESTYLE_OPTIONS.map((opt) => (
                  <button key={opt.key} type="button" onClick={() => setNestedSheet({ type: opt.key })}
                    className="w-full flex items-center gap-3 rounded-btn bg-card-hover px-4 py-3.5 text-left cursor-pointer hover:bg-card transition-colors">
                    <span className="text-[22px]">{opt.emoji}</span>
                    <div>
                      <p className="text-[14px] font-semibold text-text">{opt.label}</p>
                      <p className="text-[12px] text-muted">{opt.desc}</p>
                    </div>
                    <svg className="ml-auto text-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                  </button>
                ))}
              </div>
            )}

            {tab === "more" && (
              <div className="space-y-3">
                <h3 className="text-[14px] font-semibold text-text mb-2">Additional logging</h3>
                <button type="button" onClick={() => setNestedSheet({ type: "medication" })}
                  className="w-full flex items-center gap-3 rounded-btn bg-card-hover px-4 py-3.5 text-left cursor-pointer hover:bg-card transition-colors">
                  <span className="text-[22px]">💊</span>
                  <div>
                    <p className="text-[14px] font-semibold text-text">Medications</p>
                    <p className="text-[12px] text-muted">Log supplements or medications taken</p>
                  </div>
                </button>
                <button type="button" onClick={() => setNestedSheet({ type: "bbt" })}
                  className="w-full flex items-center gap-3 rounded-btn bg-card-hover px-4 py-3.5 text-left cursor-pointer hover:bg-card transition-colors">
                  <span className="text-[22px]">🌡️</span>
                  <div>
                    <p className="text-[14px] font-semibold text-text">Basal body temp</p>
                    <p className="text-[12px] text-muted">Log BBT reading</p>
                  </div>
                </button>
                <button type="button" onClick={() => setNestedSheet({ type: "weight" })}
                  className="w-full flex items-center gap-3 rounded-btn bg-card-hover px-4 py-3.5 text-left cursor-pointer hover:bg-card transition-colors">
                  <span className="text-[22px]">⚖️</span>
                  <div>
                    <p className="text-[14px] font-semibold text-text">Weight</p>
                    <p className="text-[12px] text-muted">Log your weight</p>
                  </div>
                </button>
              </div>
            )}

            <button type="button" onClick={handleSave} disabled={saving}
              className="mt-6 w-full rounded-btn bg-primary text-white font-semibold h-[52px] cursor-pointer transition-colors duration-200 hover:bg-primary-light disabled:opacity-50">
              {saving ? "Saving..." : editingItem ? "Update" : "Save"}
            </button>
          </>
        ) : (
          <div className="space-y-4 pb-4">
            {nestedSheet.type === "intimacy" && (
              <>
                <h3 className="text-[16px] font-semibold text-text">Log intimacy</h3>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setIntimacyProtected(false)}
                    className={`flex-1 rounded-btn px-4 py-4 text-center cursor-pointer transition-all ${intimacyProtected === false ? "bg-accent text-white" : "border border-border text-muted"}`}>
                    <p className="text-[20px] mb-1">💕</p><p className="text-[13px] font-semibold">Unprotected</p>
                  </button>
                  <button type="button" onClick={() => setIntimacyProtected(true)}
                    className={`flex-1 rounded-btn px-4 py-4 text-center cursor-pointer transition-all ${intimacyProtected === true ? "bg-accent text-white" : "border border-border text-muted"}`}>
                    <p className="text-[20px] mb-1">🛡️</p><p className="text-[13px] font-semibold">Protected</p>
                  </button>
                </div>
              </>
            )}
            {nestedSheet.type === "water" && (
              <>
                <h3 className="text-[16px] font-semibold text-text">Water intake</h3>
                <div className="text-center py-4">
                  <p className="text-[48px] font-bold text-text">{waterIntake}</p>
                  <p className="text-[14px] text-muted">glasses today</p>
                </div>
                <input type="range" min={0} max={15} step={1} value={waterIntake} onChange={(e) => setWaterIntake(Number(e.target.value))} className="w-full accent-primary" />
                <div className="flex justify-between text-[11px] text-muted"><span>0</span><span>15</span></div>
              </>
            )}
            {nestedSheet.type === "sleep" && (
              <>
                <h3 className="text-[16px] font-semibold text-text">Sleep hours</h3>
                <div className="text-center py-4">
                  <p className="text-[48px] font-bold text-text">{sleepHours}</p>
                  <p className="text-[14px] text-muted">hours of sleep</p>
                </div>
                <input type="range" min={0} max={16} step={0.5} value={sleepHours} onChange={(e) => setSleepHours(Number(e.target.value))} className="w-full accent-primary" />
                <div className="flex justify-between text-[11px] text-muted"><span>0</span><span>16</span></div>
              </>
            )}
            {nestedSheet.type === "medication" && (
              <>
                <h3 className="text-[16px] font-semibold text-text">Medications</h3>
                <div className="flex flex-wrap gap-2">
                  {COMMON_MEDS.map((med) => (
                    <button key={med} type="button" onClick={() => toggleMedication(med)}
                      className={`rounded-full px-3.5 py-2 text-[13px] font-medium cursor-pointer transition-all ${selectedMedications.has(med) ? "bg-primary text-white" : "border border-border text-muted"}`}>{med}</button>
                  ))}
                </div>
                <div className="border-t border-border pt-3">
                  <p className="text-[13px] font-semibold text-text mb-2">Custom medication</p>
                  <input value={medName} onChange={(e) => setMedName(e.target.value)} placeholder="Medication name"
                    className="w-full rounded-btn border border-border bg-card px-3 py-2.5 text-[14px] text-text outline-none focus:border-primary mb-2" />
                  <input value={medDosage} onChange={(e) => setMedDosage(e.target.value)} placeholder="Dosage (e.g. 500mg)"
                    className="w-full rounded-btn border border-border bg-card px-3 py-2.5 text-[14px] text-text outline-none focus:border-primary" />
                </div>
              </>
            )}
            {nestedSheet.type === "bbt" && (
              <VitalLogger onSave={async (payload) => { await logVitals(payload); showToastLocal("Vitals saved"); }} />
            )}
          </div>
        )}
      </BottomSheet>

      {/* Edit daily log bottom sheet */}
      <BottomSheet open={!!editingItem} onClose={() => setEditingItem(null)} title="Edit day log">
        <div className="space-y-4 pb-2">
          <div className="space-y-4">
            <div>
              <h3 className="text-[14px] font-semibold text-text mb-2">How's your flow?</h3>
              <div className="flex gap-2">
                {FLOW_OPTIONS.map((opt) => (
                  <button key={opt} type="button" onClick={() => setFlow(opt)}
                    className={`flex-1 rounded-btn px-3 py-2.5 text-[13px] font-medium cursor-pointer transition-all duration-80 ${flow === opt ? "bg-period text-white" : "border border-border bg-card text-muted hover:bg-card-hover"}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-text mb-2">Symptoms</h3>
              <div className="flex flex-wrap gap-2">
                {SYMPTOM_OPTIONS.map((name) => (
                  <button key={name} type="button" onClick={() => toggleSymptom(name)}
                    className={`rounded-full px-3.5 py-2 text-[13px] font-medium cursor-pointer transition-all duration-80 ${symptoms.has(name) ? "bg-primary text-white" : "border border-border text-muted hover:bg-card-hover"}`}>
                    {name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-text mb-2">Notes</h3>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything you want to remember..." rows={3}
                className="w-full rounded-btn border border-border bg-card px-3 py-2.5 text-[14px] text-text outline-none focus:border-primary transition-colors duration-150" />
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-text">Your mood</h3>
              <div className="flex justify-between gap-2 mt-2">
                {MOOD_SCORES.map(({ emoji, score, label }) => (
                  <button key={label} type="button" onClick={() => setMood(score)}
                    className={`flex h-[52px] w-[52px] items-center justify-center rounded-full cursor-pointer transition-all duration-150 text-[24px] ${mood === score ? "bg-primary-light/20 ring-2 ring-primary scale-110" : "text-muted hover:bg-card-hover"}`}
                    aria-label={label}>{emoji}</button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-text mb-2">Lifestyle & habits</h3>
              <div className="space-y-2">
                {LIFESTYLE_OPTIONS.map((opt) => (
                  <div key={opt.key} className="flex items-center justify-between rounded-btn border border-border bg-card px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-[22px]">{opt.emoji}</span>
                      <p className="text-[14px] font-semibold text-text">{opt.label}</p>
                    </div>
                    {opt.key === "intimacy" && (
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setIntimacyProtected(null)} className={`rounded-full px-3 py-1.5 text-[13px] font-medium cursor-pointer transition-colors ${intimacyProtected === null ? "bg-primary text-white" : "border border-border text-muted"}`}>No</button>
                        <button type="button" onClick={() => setIntimacyProtected(true)} className={`rounded-full px-3 py-1.5 text-[13px] font-medium cursor-pointer transition-colors ${intimacyProtected === true ? "bg-primary text-white" : "border border-border text-muted"}`}>Protected</button>
                        <button type="button" onClick={() => setIntimacyProtected(false)} className={`rounded-full px-3 py-1.5 text-[13px] font-medium cursor-pointer transition-colors ${intimacyProtected === false ? "bg-primary text-white" : "border border-border text-muted"}`}>Unprotected</button>
                      </div>
                    )}
                    {opt.key === "water" && (
                      <div className="flex items-center gap-2">
                        <input type="range" min={0} max={15} step={1} value={waterIntake} onChange={(e) => setWaterIntake(Number(e.target.value))} className="w-28 accent-primary" />
                        <span className="text-[13px] font-semibold text-text min-w-[24px] text-right">{waterIntake}</span>
                      </div>
                    )}
                    {opt.key === "sleep" && (
                      <div className="flex items-center gap-2">
                        <input type="range" min={0} max={16} step={0.5} value={sleepHours} onChange={(e) => setSleepHours(Number(e.target.value))} className="w-28 accent-primary" />
                        <span className="text-[13px] font-semibold text-text min-w-[38px] text-right">{sleepHours}h</span>
                      </div>
                    )}
                    {opt.key === "medication" && (
                      <button type="button" onClick={() => setNestedSheet({ type: "medication" })} className="rounded-full border border-border px-3 py-1.5 text-[13px] font-medium text-muted cursor-pointer">+ Add</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-text mb-2">Medications</h3>
              <div className="flex flex-wrap gap-2">
                {COMMON_MEDS.map((med) => (
                  <button key={med} type="button" onClick={() => toggleMedication(med)}
                    className={`rounded-full px-3.5 py-2 text-[13px] font-medium cursor-pointer transition-all ${selectedMedications.has(med) ? "bg-primary text-white" : "border border-border text-muted"}`}>{med}</button>
                ))}
              </div>
              <div className="border-t border-border pt-3 mt-3">
                <p className="text-[13px] font-semibold text-text mb-2">Custom medication</p>
                <input value={medName} onChange={(e) => setMedName(e.target.value)} placeholder="Medication name"
                  className="w-full rounded-btn border border-border bg-card px-3 py-2.5 text-[14px] text-text outline-none focus:border-primary mb-2" />
                <input value={medDosage} onChange={(e) => setMedDosage(e.target.value)} placeholder="Dosage (e.g. 500mg)"
                  className="w-full rounded-btn border border-border bg-card px-3 py-2.5 text-[14px] text-text outline-none focus:border-primary" />
              </div>
            </div>
          </div>
          <button type="button" onClick={submitEdit}
            className="w-full rounded-btn bg-primary text-white font-semibold h-[52px] cursor-pointer transition-colors duration-200 hover:bg-primary-light">Save changes</button>
        </div>
      </BottomSheet>

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
          <div className="rounded-card bg-card shadow-card p-5 w-[300px] space-y-3">
            <p className="text-[14px] font-semibold text-text">Delete this day's log?</p>
            <p className="text-[12px] text-muted">This removes the grouped daily log only, not individual symptom/vital records.</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowDeleteConfirm(null)} className="flex-1 rounded-btn border border-border py-2.5 text-[13px] font-semibold cursor-pointer">Cancel</button>
              <button type="button" onClick={() => confirmDelete(showDeleteConfirm)} className="flex-1 rounded-btn bg-danger text-white py-2.5 text-[13px] font-semibold cursor-pointer">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 rounded-full bg-primary px-5 py-2.5 text-[13px] font-semibold text-white shadow-card animate-fade-up">{toast}</div>
      )}
    </div>
  );
}
