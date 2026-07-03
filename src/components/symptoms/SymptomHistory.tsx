// SymptomHistory — weekly pattern list.
import { Card } from "../ui/Card";

interface Pattern {
  name: string;
  occurrences: number;
  avgIntensity: number;
}

interface SymptomHistoryProps {
  patterns: Pattern[];
}

export function SymptomHistory({ patterns }: SymptomHistoryProps) {
  if (!patterns.length) {
    return (
      <Card>
        <p className="text-center text-sm text-muted">
          No symptom patterns yet this week 🌿
        </p>
      </Card>
    );
  }
  return (
    <Card>
      <h3 className="mb-2 font-bold text-text">This week's patterns</h3>
      <div className="space-y-2">
        {patterns.map((p) => (
          <div
            key={p.name}
            className="flex items-center justify-between rounded-btn bg-card-hover px-3 py-2 text-sm"
          >
            <span className="font-medium text-text">{p.name}</span>
            <span className="text-muted">
              ×{p.occurrences} · avg {p.avgIntensity.toFixed(1)}/5
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
