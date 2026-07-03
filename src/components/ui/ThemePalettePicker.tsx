// ThemePalettePicker — row of palette swatches for quick theme access.
import { useAuthStore } from "../../store/authStore";
import type { ColorPalette } from "../../types";

const PALETTES: { id: ColorPalette; label: string; colors: string[] }[] = [
  { id: "default", label: "Default", colors: ["#7B4F9E", "#E879A0"] },
  { id: "blush", label: "Blush", colors: ["#D4627F", "#F2A6B8"] },
  { id: "lavender", label: "Lavender", colors: ["#8B5CF6", "#C084FC"] },
  { id: "ocean", label: "Ocean", colors: ["#3B82F6", "#06B6D4"] },
  { id: "sage", label: "Sage", colors: ["#6B8F71", "#D4A373"] },
  { id: "monochrome", label: "Mono", colors: ["#4B5563", "#9CA3AF"] },
];

export function ThemePalettePicker({ compact }: { compact?: boolean }) {
  const palette = useAuthStore((s) => s.palette);
  const setPalette = useAuthStore((s) => s.setPalette);

  if (compact) {
    // Compact row for Home header
    return (
      <div className="flex items-center gap-1">
        {PALETTES.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPalette(p.id)}
            title={p.label}
            className={`h-5 w-5 rounded-full border-2 cursor-pointer transition-transform hover:scale-110 ${
              palette === p.id ? "border-white scale-110" : "border-transparent"
            }`}
            style={{ background: `linear-gradient(135deg, ${p.colors[0]}, ${p.colors[1]})` }}
          />
        ))}
      </div>
    );
  }

  // Full picker for Profile
  return (
    <div className="space-y-2">
      <p className="text-[13px] font-semibold text-text">Color palette</p>
      <div className="grid grid-cols-3 gap-2">
        {PALETTES.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPalette(p.id)}
            className={`rounded-btn p-3 text-center cursor-pointer border-2 transition-all ${
              palette === p.id ? "border-primary bg-primary/10" : "border-border hover:bg-card-hover"
            }`}
          >
            <div className="flex gap-1 justify-center mb-1">
              <div className="h-4 w-4 rounded-full" style={{ backgroundColor: p.colors[0] }} />
              <div className="h-4 w-4 rounded-full" style={{ backgroundColor: p.colors[1] }} />
            </div>
            <span className="text-[11px] font-medium text-text">{p.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
