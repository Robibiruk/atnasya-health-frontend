// VitalLogger — BP (two inputs) + sugar + weight form with validation.
import { useState } from "react";
import { Heart, Droplets, Weight } from "lucide-react";
import { Button } from "../ui/Button";

interface VitalLoggerProps {
  onSave: (payload: {
    date: string;
    bp?: { systolic: number; diastolic: number };
    bloodSugar?: { value: number; unit: string; timing: string };
    weight?: { value: number; unit: string };
  }) => Promise<unknown>;
}

export function VitalLogger({ onSave }: VitalLoggerProps) {
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [sugar, setSugar] = useState("");
  const [sugarTiming, setSugarTiming] = useState("fasting");
  const [weight, setWeight] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const validate = (): boolean => {
    if (systolic && isNaN(Number(systolic))) {
      setError("Systolic must be a number");
      return false;
    }
    if (diastolic && isNaN(Number(diastolic))) {
      setError("Diastolic must be a number");
      return false;
    }
    if (sugar && isNaN(Number(sugar))) {
      setError("Blood sugar must be a number");
      return false;
    }
    if (weight && isNaN(Number(weight))) {
      setError("Weight must be a number");
      return false;
    }
    setError(null);
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const today = new Date().toISOString().slice(0, 10);
    const bp =
      systolic || diastolic
        ? {
            systolic: Number(systolic) || 0,
            diastolic: Number(diastolic) || 0,
          }
        : undefined;
    const bloodSugar =
      sugar && Number(sugar) > 0
        ? { value: Number(sugar), unit: "mg/dL", timing: sugarTiming }
        : undefined;
    const weightVal =
      weight && Number(weight) > 0
        ? { value: Number(weight), unit: "kg" }
        : undefined;
    await onSave({ date: today, bp, bloodSugar, weight: weightVal });
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 flex items-center gap-2 text-sm font-semibold text-text">
          <Heart className="h-4 w-4 text-period" /> Blood Pressure (mmHg)
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            inputMode="numeric"
            placeholder="Systolic"
            value={systolic}
            onChange={(e) => setSystolic(e.target.value)}
            className="w-full rounded-btn border border-border bg-card px-3 py-2 text-text outline-none focus:border-primary"
          />
          <input
            type="number"
            inputMode="numeric"
            placeholder="Diastolic"
            value={diastolic}
            onChange={(e) => setDiastolic(e.target.value)}
            className="w-full rounded-btn border border-border bg-card px-3 py-2 text-text outline-none focus:border-primary"
          />
        </div>
        {systolic && Number(systolic) < 90 && (
          <p className="mt-1 text-xs text-warning">Low BP — take it easy 💛</p>
        )}
      </div>

      <div>
        <label className="mb-1 flex items-center gap-2 text-sm font-semibold text-text">
          <Droplets className="h-4 w-4 text-accent" /> Blood Sugar (mg/dL)
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            inputMode="numeric"
            placeholder="Value"
            value={sugar}
            onChange={(e) => setSugar(e.target.value)}
            className="w-full rounded-btn border border-border bg-card px-3 py-2 text-text outline-none focus:border-primary"
          />
          <select
            value={sugarTiming}
            onChange={(e) => setSugarTiming(e.target.value)}
            className="rounded-btn border border-border bg-card px-3 py-2 text-text outline-none"
          >
            <option value="fasting">Fasting</option>
            <option value="post-meal">Post-meal</option>
          </select>
        </div>
        {sugar && Number(sugar) > 140 && sugarTiming === "post-meal" && (
          <p className="mt-1 text-xs text-danger">
            A little elevated — gentle walk can help 💗
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 flex items-center gap-2 text-sm font-semibold text-text">
          <Weight className="h-4 w-4 text-primary" /> Weight (kg)
        </label>
        <input
          type="number"
          inputMode="decimal"
          placeholder="Weight"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="w-full rounded-btn border border-border bg-card px-3 py-2 text-text outline-none focus:border-primary"
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button onClick={handleSave} fullWidth disabled={saving}>
        {saving ? "Saving…" : "Save vitals"}
      </Button>
    </div>
  );
}
