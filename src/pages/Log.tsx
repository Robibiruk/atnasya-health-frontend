// Log page — symptom/vitals/mood logging hub with expanded options: intimacy, water, sleep, medication, photo, pregnancy.
import { useState } from "react";
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

type Tab = "symptoms" | "vitals" | "mood" | "lifestyle" | "more";
const TABS: { key: Tab; label: string; emoji: string }[] = [
  { key: "symptoms", label: "Symptoms", emoji: "🌿" },
  { key: "vitals", label: "Vitals", emoji: "💗" },
  { key: "mood", label: "Mood", emoji: "😊" },
  { key: "lifestyle", label: "Lifestyle", emoji: "🌟" },
  { key: "more", label: "More", emoji: "➕" },
];

// Flow pills
const FLOW_OPTIONS = ["Spotting", "Light", "Medium", "Heavy"] as const;

// Mood icons
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

// Lifestyle options
const LIFESTYLE_OPTIONS = [
  { key: "intimacy", emoji: "💕", label: "Intimacy", desc: "Protected / unprotected" },
  { key: "water", emoji: "💧", label: "Water intake", desc: "How many glasses?" },
  { key: "sleep", emoji: "😴", label: "Sleep hours", desc: "How many hours?" },
  { key: "medication", emoji: "💊", label: "Medication", desc: "What did you take?" },
];

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

  // Lifestyle fields
  const [intimacyProtected, setIntimacyProtected] = useState<boolean | null>(null);
  const [waterIntake, setWaterIntake] = useState(5);
  const [sleepHours, setSleepHours] = useState(7);
  const [medName, setMedName] = useState("");
  const [medDosage, setMedDosage] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedMedications, setSelectedMedications] = useState<Set<string>>(new Set());

  const COMMON_MEDS = ["Prenatal vitamin", "Iron supplement", "Vitamin D", "Magnesium", "Folate", "Aspirin", "Ibuprofen", "Acetaminophen"];

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

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const handleSave = async () => {
    setSaving(true);
    const today = new Date().toISOString().slice(0, 10);

    // Mood
    if (mood !== null) {
      const emoji = mood >= 4 ? "😊" : mood >= 3 ? "😐" : "😔";
      await logMood({ date: today, score: mood, emoji });
    }

    // Symptoms
    if (symptoms.size > 0) {
      await logSymptoms(today, Array.from(symptoms).map((name) => ({ name, intensity: 3 })));
    }

    // Selfcare fields (water, sleep)
    if (waterIntake > 0) await logSelfcare(today, undefined, waterIntake, sleepHours, undefined, notes || undefined);
    else if (sleepHours > 0) await logSelfcare(today, undefined, undefined, sleepHours, undefined, notes || undefined);

    // Intimacy
    if (intimacyProtected !== null) {
      try {
        await api.post("/intimacy", { date: today, protected: intimacyProtected, notes: notes || undefined });
      } catch { /* ignore */ }
    }

    // Medications
    if (selectedMedications.size > 0) {
      for (const name of selectedMedications) {
        try {
          await api.post("/medications", { date: today, name, dosage: medDosage || "as directed", time: new Date().toTimeString().slice(0, 5) });
        } catch { /* ignore */ }
      }
    }

    // Custom medication
    if (medName) {
      try {
        await api.post("/medications", { date: today, name: medName, dosage: medDosage || "as directed", time: new Date().toTimeString().slice(0, 5) });
      } catch { /* ignore */ }
    }

    // Photo (simulated — just store URL reference)
    if (photoPreview) {
      try {
        await api.post("/photos", { date: today, url: photoPreview, caption: notes || undefined });
      } catch { /* ignore */ }
    }

    setSaving(false);
    showToast("Saved successfully");
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

  return (
    <div className="pb-24">
      <TopBar />

      {/* Empty state */}
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

      {/* Main bottom sheet */}
      <BottomSheet open={sheetOpen} onClose={() => { if (!nestedSheet) setSheetOpen(false); else setNestedSheet(null); }} title={nestedSheet ? `Log ${nestedSheet.type}` : "Log today"}>
        {!nestedSheet ? (
          <>
            {/* Tabs */}
            <div className="flex gap-1 mb-4 overflow-x-auto no-scrollbar">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={`flex-shrink-0 rounded-full px-4 py-1.5 text-[13px] font-semibold cursor-pointer transition-colors duration-150 ${
                    tab === t.key ? "bg-primary text-white" : "bg-card-hover text-muted"
                  }`}
                >
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>

            {/* SYMPTOMS TAB */}
            {tab === "symptoms" && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-[14px] font-semibold text-text mb-2">How's your flow?</h3>
                  <div className="flex gap-2">
                    {FLOW_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setFlow(opt)}
                        className={`flex-1 rounded-btn px-3 py-2.5 text-[13px] font-medium cursor-pointer transition-all duration-80 ${
                          flow === opt ? "bg-period text-white" : "border border-border bg-card text-muted hover:bg-card-hover"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold text-text mb-2">Symptoms</h3>
                  <div className="flex flex-wrap gap-2">
                    {SYMPTOM_OPTIONS.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => toggleSymptom(name)}
                        className={`rounded-full px-3.5 py-2 text-[13px] font-medium cursor-pointer transition-all duration-80 ${
                          symptoms.has(name) ? "bg-primary text-white" : "border border-border text-muted hover:bg-card-hover"
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold text-text mb-2">Notes</h3>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Anything you want to remember..."
                    rows={3}
                    className="w-full rounded-btn border border-border bg-card px-3 py-2.5 text-[14px] text-text outline-none focus:border-primary transition-colors duration-150"
                  />
                </div>
              </div>
            )}

            {/* VITALS TAB */}
            {tab === "vitals" && (
              <VitalLogger
                onSave={async (payload) => {
                  await logVitals(payload);
                  showToast("Vitals saved");
                }}
              />
            )}

            {/* MOOD TAB */}
            {tab === "mood" && (
              <div className="space-y-5">
                <h3 className="text-[14px] font-semibold text-text">Your mood</h3>
                <div className="flex justify-between gap-2">
                  {MOOD_SCORES.map(({ emoji, score, label }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setMood(score)}
                      className={`flex h-[52px] w-[52px] items-center justify-center rounded-full cursor-pointer transition-all duration-150 text-[24px] ${
                        mood === score ? "bg-primary-light/20 ring-2 ring-primary scale-110" : "text-muted hover:bg-card-hover"
                      }`}
                      aria-label={label}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <p className="text-[12px] text-muted text-center">
                  {mood !== null ? `Mood score: ${mood}/5` : "Tap a face to log your mood"}
                </p>
              </div>
            )}

            {/* LIFESTYLE TAB */}
            {tab === "lifestyle" && (
              <div className="space-y-3">
                <h3 className="text-[14px] font-semibold text-text mb-2">Lifestyle & habits</h3>
                {LIFESTYLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setNestedSheet({ type: opt.key })}
                    className="w-full flex items-center gap-3 rounded-btn bg-card-hover px-4 py-3.5 text-left cursor-pointer hover:bg-card transition-colors"
                  >
                    <span className="text-[22px]">{opt.emoji}</span>
                    <div>
                      <p className="text-[14px] font-semibold text-text">{opt.label}</p>
                      <p className="text-[12px] text-muted">{opt.desc}</p>
                    </div>
                    <svg className="ml-auto text-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                ))}

                {/* Photo attachment */}
                <button
                  type="button"
                  onClick={handlePhotoSelect}
                  className="w-full flex items-center gap-3 rounded-btn bg-card-hover px-4 py-3.5 text-left cursor-pointer hover:bg-card transition-colors"
                >
                  <span className="text-[22px]">📸</span>
                  <div>
                    <p className="text-[14px] font-semibold text-text">Add photo</p>
                    <p className="text-[12px] text-muted">{photoPreview ? "Photo selected" : "Attach an image"}</p>
                  </div>
                  {photoPreview && <span className="ml-auto text-[11px] text-success">✓</span>}
                </button>
              </div>
            )}

            {/* MORE TAB */}
            {tab === "more" && (
              <div className="space-y-3">
                <h3 className="text-[14px] font-semibold text-text mb-2">Additional logging</h3>
                <button
                  type="button"
                  onClick={() => setNestedSheet({ type: "medication" })}
                  className="w-full flex items-center gap-3 rounded-btn bg-card-hover px-4 py-3.5 text-left cursor-pointer hover:bg-card transition-colors"
                >
                  <span className="text-[22px]">💊</span>
                  <div>
                    <p className="text-[14px] font-semibold text-text">Medications</p>
                    <p className="text-[12px] text-muted">Log supplements or medications taken</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setNestedSheet({ type: "bbt" })}
                  className="w-full flex items-center gap-3 rounded-btn bg-card-hover px-4 py-3.5 text-left cursor-pointer hover:bg-card transition-colors"
                >
                  <span className="text-[22px]">🌡️</span>
                  <div>
                    <p className="text-[14px] font-semibold text-text">Basal body temp</p>
                    <p className="text-[12px] text-muted">Log BBT reading</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setNestedSheet({ type: "weight" })}
                  className="w-full flex items-center gap-3 rounded-btn bg-card-hover px-4 py-3.5 text-left cursor-pointer hover:bg-card transition-colors"
                >
                  <span className="text-[22px]">⚖️</span>
                  <div>
                    <p className="text-[14px] font-semibold text-text">Weight</p>
                    <p className="text-[12px] text-muted">Log your weight</p>
                  </div>
                </button>
              </div>
            )}

            {/* Save button */}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="mt-6 w-full rounded-btn bg-primary text-white font-semibold h-[52px] cursor-pointer transition-colors duration-200 hover:bg-primary-light disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </>
        ) : (
          /* NESTED SHEETS */
          <div className="space-y-4 pb-4">
            {nestedSheet.type === "intimacy" && (
              <>
                <h3 className="text-[16px] font-semibold text-text">Log intimacy</h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIntimacyProtected(false)}
                    className={`flex-1 rounded-btn px-4 py-4 text-center cursor-pointer transition-all ${
                      intimacyProtected === false ? "bg-accent text-white" : "border border-border text-muted"
                    }`}
                  >
                    <p className="text-[20px] mb-1">💕</p>
                    <p className="text-[13px] font-semibold">Unprotected</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIntimacyProtected(true)}
                    className={`flex-1 rounded-btn px-4 py-4 text-center cursor-pointer transition-all ${
                      intimacyProtected === true ? "bg-accent text-white" : "border border-border text-muted"
                    }`}
                  >
                    <p className="text-[20px] mb-1">🛡️</p>
                    <p className="text-[13px] font-semibold">Protected</p>
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
                    <button
                      key={med}
                      type="button"
                      onClick={() => toggleMedication(med)}
                      className={`rounded-full px-3.5 py-2 text-[13px] font-medium cursor-pointer transition-all ${
                        selectedMedications.has(med) ? "bg-primary text-white" : "border border-border text-muted"
                      }`}
                    >
                      {med}
                    </button>
                  ))}
                </div>
                <div className="border-t border-border pt-3">
                  <p className="text-[13px] font-semibold text-text mb-2">Custom medication</p>
                  <input
                    value={medName}
                    onChange={(e) => setMedName(e.target.value)}
                    placeholder="Medication name"
                    className="w-full rounded-btn border border-border bg-card px-3 py-2.5 text-[14px] text-text outline-none focus:border-primary mb-2"
                  />
                  <input
                    value={medDosage}
                    onChange={(e) => setMedDosage(e.target.value)}
                    placeholder="Dosage (e.g. 500mg)"
                    className="w-full rounded-btn border border-border bg-card px-3 py-2.5 text-[14px] text-text outline-none focus:border-primary"
                  />
                </div>
              </>
            )}
            {nestedSheet.type === "bbt" && (
              <div className="text-center py-4 space-y-3">
                <span className="text-[40px]">🌡️</span>
                <p className="text-[14px] text-muted">Log BBT via Vitals tab</p>
                <p className="text-[12px] text-muted">Go to Vitals → BBT to log your temperature.</p>
              </div>
            )}
            {nestedSheet.type === "weight" && (
              <div className="text-center py-4 space-y-3">
                <span className="text-[40px]">⚖️</span>
                <p className="text-[14px] text-muted">Log weight via Vitals tab</p>
                <p className="text-[12px] text-muted">Go to Vitals → Weight to log.</p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setNestedSheet(null)}
              className="w-full rounded-btn border border-border px-4 py-2.5 text-[13px] font-semibold text-muted cursor-pointer hover:bg-card-hover"
            >
              Done
            </button>
          </div>
        )}
      </BottomSheet>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 rounded-full bg-primary px-5 py-2.5 text-[13px] font-semibold text-white shadow-card animate-fade-up">
          {toast}
        </div>
      )}
    </div>
  );
}
