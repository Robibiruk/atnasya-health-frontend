// VitalChart — Recharts LineChart, 7d/30d, with phase color reference.
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useState } from "react";
import { Card } from "../ui/Card";

interface VitalPoint {
  date: string;
  systolic: number | null;
  diastolic: number | null;
  sugar: number | null;
  weight: number | null;
  phase?: string;
}

interface VitalChartProps {
  data: VitalPoint[];
}

export function VitalChart({ data }: VitalChartProps) {
  const [range, setRange] = useState<"bp" | "sugar" | "weight">("bp");

  if (!data.length) {
    return (
      <Card>
        <p className="text-center text-sm text-muted">
          No vitals logged yet 💗
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="mb-3 flex gap-2">
        {(["bp", "sugar", "weight"] as const).map((r) => (
          <button
            type="button"
            key={r}
            onClick={() => setRange(r)}
            className={`tap rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              range === r
                ? "bg-primary text-white"
                : "bg-card-hover text-muted"
            }`}
          >
            {r === "bp" ? "BP" : r === "sugar" ? "Sugar" : "Weight"}
          </button>
        ))}
      </div>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "var(--color-muted)" }}
              tickFormatter={(d: string) => d.slice(5)}
            />
            <YAxis tick={{ fontSize: 10, fill: "var(--color-muted)" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: 12,
                color: "var(--color-text)",
              }}
            />
            <Legend />
            {range === "bp" && (
              <>
                <Line
                  type="monotone"
                  dataKey="systolic"
                  stroke="var(--color-period)"
                  strokeWidth={2}
                  dot={false}
                  name="Systolic"
                />
                <Line
                  type="monotone"
                  dataKey="diastolic"
                  stroke="var(--color-accent)"
                  strokeWidth={2}
                  dot={false}
                  name="Diastolic"
                />
              </>
            )}
            {range === "sugar" && (
              <Line
                type="monotone"
                dataKey="sugar"
                stroke="var(--color-ovulation)"
                strokeWidth={2}
                dot={false}
                name="Blood sugar"
              />
            )}
            {range === "weight" && (
              <Line
                type="monotone"
                dataKey="weight"
                stroke="var(--color-fertile)"
                strokeWidth={2}
                dot={false}
                name="Weight"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
