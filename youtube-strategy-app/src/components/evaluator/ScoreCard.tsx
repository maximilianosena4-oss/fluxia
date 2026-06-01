"use client";

import type { NicheScoreBreakdown, NicheVerdict } from "@/types";
import { getVerdictMessage } from "@/lib/scoring/nicheScore";

interface ScoreCardProps {
  score: NicheScoreBreakdown;
  verdict: NicheVerdict;
  nicheName: string;
}

const CRITERIA = [
  { key: "marketDemand",    label: "Demanda de mercado",   max: 24, color: "var(--accent-primary)" },
  { key: "lowCompetition",  label: "Competencia baja",     max: 24, color: "var(--accent-secondary)" },
  { key: "monetizationRpm", label: "RPM / Monetización",   max: 16, color: "var(--accent-success)" },
  { key: "entryBarriers",   label: "Barreras de entrada",  max: 12, color: "var(--accent-warning)" },
  { key: "scalability",     label: "Escalabilidad",        max: 12, color: "var(--accent-warning)" },
  { key: "aiProduction",    label: "Producción con IA",    max: 8,  color: "var(--accent-primary)" },
] as const;

const VERDICT_CONFIG: Record<NicheVerdict, { bg: string; border: string; emoji: string }> = {
  GO:      { bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.3)", emoji: "🚀" },
  REFINE:  { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)", emoji: "⚡" },
  DISCARD: { bg: "rgba(239,68,68,0.1)",  border: "rgba(239,68,68,0.3)",  emoji: "❌" },
};

export function ScoreCard({ score, verdict, nicheName }: ScoreCardProps) {
  const cfg = VERDICT_CONFIG[verdict];

  return (
    <div className="space-y-6">
      {/* Resultado principal */}
      <div
        className="rounded-2xl p-6 text-center border"
        style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}
      >
        <div className="text-5xl mb-2">{cfg.emoji}</div>
        <div
          className="text-6xl font-black tabular-nums mb-1"
          style={{
            color:
              verdict === "GO"
                ? "var(--accent-success)"
                : verdict === "REFINE"
                ? "var(--accent-warning)"
                : "var(--accent-danger)",
          }}
        >
          {score.total}
        </div>
        <div className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>
          puntos de 96 máximos
        </div>
        <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
          &ldquo;{nicheName}&rdquo;
        </h3>
        <p className="mt-2 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
          {getVerdictMessage(verdict)}
        </p>
      </div>

      {/* Tabla de desglose */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: "var(--border-default)" }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: "var(--bg-card)" }}>
              <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--text-muted)" }}>
                Criterio
              </th>
              <th className="text-right px-4 py-3 font-medium" style={{ color: "var(--text-muted)" }}>
                Puntaje
              </th>
              <th className="text-right px-4 py-3 font-medium" style={{ color: "var(--text-muted)" }}>
                Máximo
              </th>
            </tr>
          </thead>
          <tbody>
            {CRITERIA.map((c, i) => {
              const value = score[c.key];
              const pct = (value / c.max) * 100;
              return (
                <tr
                  key={c.key}
                  style={{
                    backgroundColor: i % 2 === 0 ? "var(--bg-secondary)" : "var(--bg-card)",
                  }}
                >
                  <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: c.color }}
                      />
                      {c.label}
                    </div>
                    {/* Mini progress bar */}
                    <div className="mt-1 w-full h-1 rounded-full" style={{ backgroundColor: "var(--bg-primary)" }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: c.color }}
                      />
                    </div>
                  </td>
                  <td
                    className="px-4 py-3 text-right font-bold tabular-nums"
                    style={{ color: c.color }}
                  >
                    {value}
                  </td>
                  <td
                    className="px-4 py-3 text-right tabular-nums"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {c.max}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ backgroundColor: "var(--bg-primary)" }}>
              <td className="px-4 py-3 font-bold" style={{ color: "var(--text-primary)" }}>
                TOTAL
              </td>
              <td
                className="px-4 py-3 text-right font-black text-lg tabular-nums"
                style={{
                  color:
                    verdict === "GO"
                      ? "var(--accent-success)"
                      : verdict === "REFINE"
                      ? "var(--accent-warning)"
                      : "var(--accent-danger)",
                }}
              >
                {score.total}
              </td>
              <td className="px-4 py-3 text-right font-bold" style={{ color: "var(--text-muted)" }}>
                96
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
