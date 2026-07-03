// MoodCalendar — 90-day color heatmap grid.
import { Card } from "../ui/Card";

interface MoodCell {
  date: string;
  score: number;
  emoji: string;
}

interface MoodCalendarProps {
  cells: MoodCell[];
}

function colorForScore(score: number): string {
  // 1 (rough) → muted, 5 (great) → accent
  const colors = [
    "var(--color-muted)",
    "var(--color-pms)",
    "var(--color-follicular)",
    "var(--color-fertile)",
    "var(--color-accent)",
  ];
  return colors[Math.max(0, Math.min(4, score - 1))];
}

export function MoodCalendar({ cells }: MoodCalendarProps) {
  if (!cells.length) {
    return (
      <Card>
        <p className="text-center text-sm text-muted">
          Log your mood to grow your heatmap 🌱
        </p>
      </Card>
    );
  }

  // Build a dense grid (weeks × 7 days) for the last 90 days.
  const byDate = new Map(cells.map((c) => [c.date, c]));
  const today = new Date();
  const grid: Array<{ date: string; score: number } | null> = [];
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const cell = byDate.get(iso);
    grid.push(cell ? { date: iso, score: cell.score } : null);
  }

  return (
    <Card>
      <h3 className="mb-2 font-bold text-text">90-day mood</h3>
      <div className="flex flex-wrap gap-1">
        {grid.map((g, i) => (
          <div
            key={i}
            title={g ? `${g.date} · ${g.score}/5` : ""}
            className="h-3 w-3 rounded-sm"
            style={{
              backgroundColor: g ? colorForScore(g.score) : "var(--color-border)",
            }}
          />
        ))}
      </div>
    </Card>
  );
}
