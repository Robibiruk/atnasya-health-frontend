// MoodPicker — 5-emoji strip, animated select.
import { useState } from "react";
import { motion } from "framer-motion";

const MOODS = [
  { emoji: "😢", score: 1, label: "Rough" },
  { emoji: "😕", score: 2, label: "Meh" },
  { emoji: "😐", score: 3, label: "Okay" },
  { emoji: "🙂", score: 4, label: "Good" },
  { emoji: "😄", score: 5, label: "Great" },
];

interface MoodPickerProps {
  onSave: (payload: {
    score: number;
    emoji: string;
    note?: string;
  }) => Promise<unknown>;
}

export function MoodPicker({ onSave }: MoodPickerProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (selected === null) return;
    const mood = MOODS[selected];
    setSaving(true);
    await onSave({ score: mood.score, emoji: mood.emoji, note: note || undefined });
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-text">How are you feeling?</p>
      <div className="flex justify-between gap-2">
        {MOODS.map((m, i) => (
          <motion.button
            key={m.score}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSelected(i)}
            className={`tap flex flex-1 flex-col items-center gap-1 rounded-btn border p-3 transition-colors ${
              selected === i
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:bg-card-hover"
            }`}
          >
            <span
              className={`text-3xl transition-transform ${
                selected === i ? "scale-125" : ""
              }`}
            >
              {m.emoji}
            </span>
            <span className="text-[11px] text-muted">{m.label}</span>
          </motion.button>
        ))}
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add a note (optional)…"
        rows={2}
        className="w-full rounded-btn border border-border bg-card px-3 py-2 text-sm text-text outline-none focus:border-primary"
      />

      <button
        onClick={handleSave}
        disabled={saving || selected === null}
        className="tap w-full rounded-btn bg-primary px-4 py-3 font-semibold text-white disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save mood"}
      </button>
    </div>
  );
}
