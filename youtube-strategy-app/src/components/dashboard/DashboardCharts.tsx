"use client";

import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from "recharts";

interface PhaseProgressProps {
  phases: Array<{
    phase: number;
    label: string;
    total: number;
    completed: number;
    color: string;
  }>;
}

export function PhaseProgressChart({ phases }: PhaseProgressProps) {
  const data = phases.map((p) => ({
    name: `F${p.phase}`,
    label: p.label,
    value: p.total > 0 ? Math.round((p.completed / p.total) * 100) : 0,
    fill: p.color,
  }));

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
        Progreso por fase
      </p>
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.name} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span style={{ color: "var(--text-secondary)" }}>{item.label}</span>
              <span className="font-semibold" style={{ color: item.fill }}>{item.value}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-card)" }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${item.value}%`, backgroundColor: item.fill }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface NicheScoreChartProps {
  score: number;
  maxScore?: number;
}

export function NicheScoreChart({ score, maxScore = 96 }: NicheScoreChartProps) {
  const pct = Math.round((score / maxScore) * 100);
  const color = score >= 70 ? "var(--accent-success)" : score >= 50 ? "var(--accent-warning)" : "var(--accent-danger)";

  const data = [{ name: "Score", value: pct, fill: color }];

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="70%"
            outerRadius="90%"
            startAngle={90}
            endAngle={-270}
            data={data}
          >
            <RadialBar dataKey="value" cornerRadius={8} background={{ fill: "var(--bg-card)" }} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black" style={{ color }}>{score}</span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>/{maxScore}</span>
        </div>
      </div>
    </div>
  );
}

interface ScoreBreakdownChartProps {
  breakdown: Array<{ label: string; value: number; max: number }>;
}

export function ScoreBreakdownChart({ breakdown }: ScoreBreakdownChartProps) {
  const data = breakdown.map((b) => ({
    name: b.label.length > 12 ? b.label.slice(0, 12) + "…" : b.label,
    fullName: b.label,
    score: b.value,
    max: b.max,
    pct: b.max > 0 ? Math.round((b.value / b.max) * 100) : 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: "var(--text-muted)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis hide />
        <Tooltip
          cursor={false}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload as typeof data[0];
            return (
              <div
                className="rounded-lg px-3 py-2 text-xs shadow-lg border"
                style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
              >
                <p className="font-semibold">{d.fullName}</p>
                <p style={{ color: "var(--accent-primary)" }}>{d.score}/{d.max} pts ({d.pct}%)</p>
              </div>
            );
          }}
        />
        <Bar dataKey="score" radius={[4, 4, 0, 0]} maxBarSize={32}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.pct >= 75 ? "var(--accent-success)" : entry.pct >= 50 ? "var(--accent-primary)" : "var(--accent-warning)"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

interface RoadmapDonutProps {
  completed: number;
  total: number;
}

export function RoadmapDonut({ completed, total }: RoadmapDonutProps) {
  const remaining = Math.max(0, total - completed);
  const data = [
    { name: "Completadas", value: completed, color: "var(--accent-primary)" },
    { name: "Pendientes", value: remaining, color: "var(--bg-card)" },
  ];
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={120}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={38}
            outerRadius={52}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-black" style={{ color: "var(--accent-primary)" }}>{pct}%</span>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>{completed}/{total}</span>
      </div>
    </div>
  );
}
