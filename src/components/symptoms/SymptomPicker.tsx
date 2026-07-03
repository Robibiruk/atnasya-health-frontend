// SymptomPicker — 12-item grid, tap to select, hold = intensity.
import { useState } from "react";

const SYMPTOMS = [
  { name: "Headache", emoji: "🤕" },
  { name: "Cramps", emoji: "🩸" },
  { name: "Bloating", emoji: "💨" },
  { name: "Backache", emoji: "🦴" },
  { name: "Fatigue", emoji: "😴" },
  { name: "Acne", emoji: "✨" },
  { name: "Breast tenderness", emoji: "💗" },
  { name: "Nausea", emoji: "🤢" },
  { name: "Insomnia", emoji: "🌙" },
  { name: "Cravings", emoji: "🍫" },
  { name: "Mood swings", emoji: "🎭" },
  { name: "Discharge", emoji: "💧" },
];

interface SymptomPickerProps {
  onSave: (items: Array<{ name: string; intensity: number }>) => Promise<unknown>;
}

export function SymptomPicker({ onSave }: SymptomPickerProps) {
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  const toggle = (name: string) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[name]) {
        delete next[name];
      } else {
        next[name] = 3; // default medium intensity
      }
      return next;
    });
  };

  const setIntensity = (name: string, intensity: number) => {
    setSelected((prev) => ({ ...prev, [name]: intensity }));
  };

  const handleSave = async () => {
    const items = Object.entries(selected).map(([name, intensity]) => ({
      name,
      intensity,
    }));
    if (!items.length) return;
    setSaving(true);
    await onSave(items);
    setSaving(false);
    setSelected({});
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {SYMPTOMS.map((s) => {
          const intensity = selected[s.name];
          const active = intensity !== undefined;
          return (
            <button
              key={s.name}
              onClick={() => toggle(s.name)}
              onContextMenu={(e) => {
                e.preventDefault();
                if (active) {
                  const next = intensity >= 5 ? 1 : intensity + 1;
                  setIntensity(s.name, next);
                }
              }}
              className={`tap flex flex-col items-center gap-1 rounded-btn border p-3 text-xs transition-colors ${
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted hover:bg-card-hover"
              }`}
              title="Tap to select, hold/right-click to raise intensity"
            >
              <span className="text-xl">{s.emoji}</span>
              <span className="font-medium">{s.name}</span>
              {active && (
                <span className="text-[10px] text-muted">
                  {"●".repeat(intensity)}
                  {"○".repeat(5 - intensity)}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <button
        onClick={handleSave}
        disabled={saving || Object.keys(selected).length === 0}
        className="tap w-full rounded-btn bg-primary px-4 py-3 font-semibold text-white disabled:opacity-50"
      >
        {saving ? "Saving…" : `Save ${Object.keys(selected).length} symptom(s)`}
      </button>
    </div>
  );
}
