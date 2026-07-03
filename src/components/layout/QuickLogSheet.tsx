// QuickLogSheet — the + floating button experience.
// Floating circular button bottom-right. Tap → Framer Motion bottom sheet (80% height).
// Tabs inside: Period | Symptoms | Vitals | Mood.
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { BottomSheet } from "../ui/BottomSheet";
import { SymptomPicker } from "../symptoms/SymptomPicker";
import { VitalLogger } from "../vitals/VitalLogger";
import { MoodPicker } from "../mood/MoodPicker";
import { useCycle } from "../../hooks/useCycle";
import { useVitals } from "../../hooks/useVitals";
import { useSymptoms } from "../../hooks/useSymptoms";
import { useMood } from "../../hooks/useMood";

type Tab = "period" | "symptoms" | "vitals" | "mood";
const TABS: { key: Tab; label: string; emoji: string }[] = [
  { key: "period", label: "Period", emoji: "🌹" },
  { key: "symptoms", label: "Symptoms", emoji: "🌿" },
  { key: "vitals", label: "Vitals", emoji: "💗" },
  { key: "mood", label: "Mood", emoji: "😊" },
];

export function QuickLogSheet() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("period");
  const [periodOn, setPeriodOn] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const { logPeriod } = useCycle();
  const { logVitals } = useVitals();
  const { logSymptoms } = useSymptoms();
  const { logMood } = useMood();

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const savePeriod = async () => {
    const today = new Date().toISOString().slice(0, 10);
    // When period is not yet started, log the start date
    // When period is already started, log the end date
    if (!periodOn) {
      await logPeriod(today, undefined);
      showToast("Period started 🌹");
    } else {
      await logPeriod(today, today);
      showToast("Period ended");
    }
    setPeriodOn(!periodOn);
  };

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen(true)}
        className="tap fixed bottom-24 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-card"
        aria-label="Quick log"
      >
        <Plus className="h-7 w-7" />
      </motion.button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Log today">
        <div className="mb-3 flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`tap flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                tab === t.key
                  ? "bg-primary text-white"
                  : "bg-card-hover text-muted"
              }`}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        <div className="mt-2">
          {tab === "period" && (
            <div className="space-y-3">
              <p className="text-sm text-muted">
                {periodOn
                  ? "Your period is marked as started."
                  : "Tap to mark your period as started."}
              </p>
              <button
                type="button"
                onClick={savePeriod}
                className="tap w-full rounded-btn bg-period px-4 py-3 font-semibold text-white"
              >
                {periodOn ? "Period ended today" : "Period started today"}
              </button>
            </div>
          )}
          {tab === "symptoms" && (
            <SymptomPicker
              onSave={async (items) => {
                const today = new Date().toISOString().slice(0, 10);
                await logSymptoms(today, items);
                showToast("Symptoms saved 🌿");
              }}
            />
          )}
          {tab === "vitals" && (
            <VitalLogger
              onSave={async (payload) => {
                await logVitals(payload);
                showToast("Vitals saved 💗");
              }}
            />
          )}
          {tab === "mood" && (
            <MoodPicker
              onSave={async (payload) => {
                const today = new Date().toISOString().slice(0, 10);
                await logMood({ date: today, ...payload });
                showToast("Mood saved 😊");
              }}
            />
          )}
        </div>
      </BottomSheet>

      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-40 left-1/2 z-50 -translate-x-1/2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-card"
        >
          {toast}
        </motion.div>
      )}
    </>
  );
}
