"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie,
} from "recharts";
import { PhaseProgressChart } from "@/components/dashboard/DashboardCharts";

interface Props {
  evaluations: Array<{
    id: string;
    totalScore: number;
    recommendation: string;
    createdAt: string;
    criteriaJson: Record<string, unknown>;
  }>;
  actionItems: Array<{ phase: number; completed: boolean }>;
  contentIdeas: Array<{ status: string; outlierScore: number | null }>;
  niche: string | null;
}

const PHASE_COLORS = [
  "var(--accent-primary)",
  "var(--accent-secondary)",
  "var(--accent-success)",
  "var(--accent-warning)",
];

const PHASE_LABELS = ["Validación", "Setup", "Crecimiento", "Monetización"];

export function AnalyticsDashboard({ evaluations, actionItems, contentIdeas, niche }: Props) {
  const phaseData = useMemo(() => {
    return [0, 1, 2, 3].map((phase) => {
      const phaseTasks = actionItems.filter((i) => i.phase === phase);
      const done = phaseTasks.filter((i) => i.completed).length;
      return {
        name: PHASE_LABELS[phase],
        total: phaseTasks.length,
        completed: done,
        pct: phaseTasks.length > 0 ? Math.round((done / phaseTasks.length) * 100) : 0,
        color: PHASE_COLORS[phase],
      };
    });
  }, [actionItems]);

  const scoreHistory = useMemo(() =>
    evaluations
      .slice()
      .reverse()
      .map((e, i) => ({
        name: `Eval ${i + 1}`,
        score: Math.round(e.totalScore),
        date: new Date(e.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "short" }),
      })),
    [evaluations]
  );

  const ideasByStatus = useMemo(() => {
    const map: Record<string, number> = {};
    contentIdeas.forEach((i) => {
      map[i.status] = (map[i.status] ?? 0) + 1;
    });
    return Object.entries(map).map(([status, count]) => ({
      name: { pending: "Pendiente", "in-progress": "En progreso", published: "Publicada", archived: "Archivada" }[status] ?? status,
      value: count,
      color: { pending: "var(--accent-primary)", "in-progress": "var(--accent-warning)", published: "var(--accent-success)", archived: "var(--text-muted)" }[status] ?? "var(--text-muted)",
    }));
  }, [contentIdeas]);

  const totalDone = actionItems.filter((i) => i.completed).length;
  const totalItems = actionItems.length;
  const globalPct = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0;
  const latestScore = evaluations[0]?.totalScore ?? null;
  const publishedCount = contentIdeas.filter((i) => i.status === "published").length;

  if (totalItems === 0 && evaluations.length === 0) {
    return (
      <div className="text-center py-20 space-y-4">
        <div className="text-5xl">📊</div>
        <h3 className="font-semibold text-lg" style={{ color: "var(--text-primary)" }}>
          Sin datos todavía
        </h3>
        <p className="text-sm max-w-sm mx-auto" style={{ color: "var(--text-secondary)" }}>
          Evaluá tu nicho y completá tareas del roadmap para ver tus métricas acá.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Progreso total", value: `${globalPct}%`, sub: `${totalDone}/${totalItems} tareas`, color: "var(--accent-primary)" },
          { label: "Evaluaciones", value: evaluations.length, sub: latestScore ? `Último: ${Math.round(latestScore)}/96` : "Sin evaluar", color: "var(--accent-secondary)" },
          { label: "Ideas generadas", value: contentIdeas.length, sub: `${publishedCount} publicadas`, color: "var(--accent-success)" },
          { label: "Score del nicho", value: latestScore ? `${Math.round(latestScore)}/96` : "—", sub: niche ?? "Sin nicho", color: "var(--accent-warning)" },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="pt-1">
              <p className="text-xs uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>{kpi.label}</p>
              <p className="text-2xl font-black" style={{ color: kpi.color }}>{kpi.value}</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progreso por fase — barras de progreso */}
      <Card>
        <CardHeader><CardTitle>Progreso por fase del roadmap</CardTitle></CardHeader>
        <CardContent>
          <PhaseProgressChart phases={phaseData.map((p, i) => ({ phase: i, label: p.name, total: p.total, completed: p.completed, color: p.color }))} />
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Progreso por fase — gráfico de barras */}
        <Card>
          <CardHeader><CardTitle>Completado por fase (%)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={phaseData} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} hide />
                <Tooltip
                  cursor={false}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload as typeof phaseData[0];
                    return (
                      <div className="rounded-lg px-3 py-2 text-xs border shadow"
                        style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}>
                        <p className="font-semibold">{d.name}</p>
                        <p>{d.completed}/{d.total} tareas ({d.pct}%)</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="pct" radius={[4, 4, 0, 0]} maxBarSize={40}>
                  {phaseData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Historial de scores */}
        {scoreHistory.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Historial de evaluaciones</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={scoreHistory} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 96]} hide />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="rounded-lg px-3 py-2 text-xs border shadow"
                          style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}>
                          <p>Score: <strong style={{ color: "var(--accent-primary)" }}>{payload[0].value}/96</strong></p>
                        </div>
                      );
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="var(--accent-primary)"
                    strokeWidth={2.5}
                    dot={{ fill: "var(--accent-primary)", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Ideas por estado */}
        {ideasByStatus.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Ideas por estado</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width={120} height={120}>
                  <PieChart>
                    <Pie data={ideasByStatus} cx="50%" cy="50%" innerRadius={35} outerRadius={52} dataKey="value" strokeWidth={0}>
                      {ideasByStatus.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {ideasByStatus.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span style={{ color: "var(--text-secondary)" }}>{item.name}</span>
                      <span className="font-bold ml-1" style={{ color: item.color }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recomendaciones rápidas */}
        <Card>
          <CardHeader><CardTitle>Próximo foco recomendado</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {phaseData.map((phase) => {
              if (phase.total === 0 || phase.pct === 100) return null;
              return (
                <div key={phase.name} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: phase.color }} />
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: "var(--text-secondary)" }}>{phase.name}</span>
                      <span style={{ color: phase.color }}>{phase.pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-card)" }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${phase.pct}%`, backgroundColor: phase.color }} />
                    </div>
                  </div>
                </div>
              );
            })}
            {phaseData.every((p) => p.total === 0) && (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Evaluá tu nicho para generar el roadmap personalizado.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
