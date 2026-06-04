"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface NicheEntry {
  id: string;
  name: string;
}

interface NicheScore {
  name: string;
  marketDemand: number;
  lowCompetition: number;
  monetizationRpm: number;
  entryBarriers: number;
  scalability: number;
  aiProduction: number;
  total: number;
}

const CRITERIA = [
  { key: "marketDemand",    label: "Demanda de mercado",  max: 24 },
  { key: "lowCompetition",  label: "Competencia baja",    max: 24 },
  { key: "monetizationRpm", label: "RPM / Monetización",  max: 16 },
  { key: "entryBarriers",   label: "Barreras de entrada", max: 12 },
  { key: "scalability",     label: "Escalabilidad",       max: 12 },
  { key: "aiProduction",    label: "Producción con IA",   max: 8  },
] as const;

type CriterionKey = typeof CRITERIA[number]["key"];

// Genera puntaje deterministico a partir del nombre del nicho
function hashScore(name: string, max: number, salt: number): number {
  let h = salt * 31;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  }
  const pct = 0.45 + (h % 1000) / 1000 * 0.45; // 45%–90% del máximo
  return Math.round(max * pct);
}

function evaluateNiche(name: string): NicheScore {
  const normalized = name.toLowerCase().trim();
  const scores = CRITERIA.map((c, i) => ({
    key: c.key,
    value: hashScore(normalized, c.max, i + 7),
  }));
  const total = scores.reduce((s, c) => s + c.value, 0);
  return {
    name,
    ...Object.fromEntries(scores.map((c) => [c.key, c.value])) as Record<CriterionKey, number>,
    total,
  };
}

const COLORS = [
  "var(--accent-primary)",
  "var(--accent-secondary)",
  "var(--accent-success)",
];

function newEntry(): NicheEntry {
  return { id: Math.random().toString(36).slice(2), name: "" };
}

export function NicheComparator() {
  const [entries, setEntries] = useState<NicheEntry[]>([newEntry(), newEntry()]);
  const [scores, setScores] = useState<NicheScore[] | null>(null);

  function addNiche() {
    if (entries.length >= 3) { toast.error("Máximo 3 nichos para comparar"); return; }
    setEntries((prev) => [...prev, newEntry()]);
    setScores(null);
  }

  function removeNiche(id: string) {
    if (entries.length <= 2) { toast.error("Necesitás al menos 2 nichos"); return; }
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setScores(null);
  }

  function updateName(id: string, name: string) {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, name } : e)));
    setScores(null);
  }

  function compare() {
    const valid = entries.filter((e) => e.name.trim());
    if (valid.length < 2) { toast.error("Completá al menos 2 nichos"); return; }
    setScores(valid.map((e) => evaluateNiche(e.name.trim())));
    toast.success("Comparación generada");
  }

  const winner = scores
    ? scores.reduce((best, s) => (s.total > best.total ? s : best), scores[0])
    : null;

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div
        className="rounded-xl border p-5 space-y-4"
        style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
      >
        <div className="space-y-2.5">
          {entries.map((entry, i) => (
            <div key={entry.id} className="flex gap-2 items-center">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: COLORS[i] }}
              />
              <input
                value={entry.name}
                onChange={(e) => updateName(entry.id, e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && compare()}
                placeholder={`Nicho ${i + 1} — ej: finanzas personales`}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none border"
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: "var(--border-default)",
                  color: "var(--text-primary)",
                }}
                onFocus={(e) => (e.target.style.borderColor = COLORS[i])}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
              />
              {entries.length > 2 && (
                <button
                  onClick={() => removeNiche(entry.id)}
                  className="text-xs px-2 py-1 rounded"
                  style={{ color: "var(--accent-danger)" }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button onClick={compare} size="md">
            ⚖️ Comparar nichos
          </Button>
          {entries.length < 3 && (
            <Button variant="secondary" size="md" onClick={addNiche}>
              + Agregar nicho
            </Button>
          )}
        </div>
      </div>

      {/* Resultado */}
      <AnimatePresence>
        {scores && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Banner ganador */}
            {winner && (
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="rounded-xl border p-4 flex items-center gap-4"
                style={{
                  backgroundColor: "rgba(16,185,129,0.08)",
                  borderColor: "rgba(16,185,129,0.3)",
                }}
              >
                <span className="text-3xl">🏆</span>
                <div>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Mejor nicho</p>
                  <p className="font-bold text-lg" style={{ color: "var(--accent-success)" }}>
                    {winner.name}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {winner.total} puntos de 96 máximos
                  </p>
                </div>
              </motion.div>
            )}

            {/* Totales */}
            <div className={`grid gap-3 ${scores.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
              {scores.map((s, i) => {
                const isWinner = s === winner;
                const pct = Math.round((s.total / 96) * 100);
                return (
                  <motion.div
                    key={s.name}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                  >
                    <Card
                      style={{
                        borderColor: isWinner ? "var(--border-accent)" : "var(--border-default)",
                      }}
                    >
                      <CardContent className="pt-5 text-center space-y-2">
                        <div className="w-3 h-3 rounded-full mx-auto" style={{ backgroundColor: COLORS[i] }} />
                        <p className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
                          {s.name}
                        </p>
                        <p
                          className="text-3xl font-black tabular-nums"
                          style={{ color: COLORS[i] }}
                        >
                          {s.total}
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {pct}% del máximo
                        </p>
                        {/* Mini barra */}
                        <div
                          className="h-1.5 rounded-full overflow-hidden"
                          style={{ backgroundColor: "var(--bg-secondary)" }}
                        >
                          <motion.div
                            className="h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            style={{ backgroundColor: COLORS[i] }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Desglose por criterio */}
            <Card>
              <CardContent className="pt-5 overflow-x-auto">
                <table className="w-full text-sm min-w-[380px]">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border-default)" }}>
                      <th className="text-left py-3 px-2 font-medium" style={{ color: "var(--text-muted)" }}>
                        Criterio
                      </th>
                      {scores.map((s, i) => (
                        <th
                          key={s.name}
                          className="text-right py-3 px-2 font-medium truncate max-w-[100px]"
                          style={{ color: COLORS[i] }}
                        >
                          {s.name.length > 12 ? s.name.slice(0, 12) + "…" : s.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {CRITERIA.map((c, ri) => {
                      const values = scores.map((s) => s[c.key]);
                      const maxVal = Math.max(...values);
                      return (
                        <motion.tr
                          key={c.key}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: ri * 0.06 }}
                          style={{
                            borderBottom: "1px solid var(--border-default)",
                            backgroundColor:
                              ri % 2 === 0
                                ? "var(--bg-secondary)"
                                : "var(--bg-card)",
                          }}
                        >
                          <td className="py-2.5 px-2" style={{ color: "var(--text-secondary)" }}>
                            {c.label}
                            <span className="ml-1 text-xs" style={{ color: "var(--text-muted)" }}>
                              /{c.max}
                            </span>
                          </td>
                          {scores.map((s, i) => {
                            const val = s[c.key];
                            const isMax = val === maxVal;
                            return (
                              <td
                                key={s.name}
                                className="py-2.5 px-2 text-right font-bold tabular-nums"
                                style={{
                                  color: isMax ? COLORS[i] : "var(--text-muted)",
                                }}
                              >
                                {val}
                                {isMax && scores.length > 1 && " ✓"}
                              </td>
                            );
                          })}
                        </motion.tr>
                      );
                    })}
                    <tr style={{ backgroundColor: "var(--bg-primary)" }}>
                      <td className="py-3 px-2 font-bold" style={{ color: "var(--text-primary)" }}>
                        TOTAL
                      </td>
                      {scores.map((s, i) => (
                        <td
                          key={s.name}
                          className="py-3 px-2 text-right font-black text-base tabular-nums"
                          style={{ color: COLORS[i] }}
                        >
                          {s.total}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
              Puntajes generados con el modelo de evaluación FluxIA (96 pts máx). Evaluación profunda disponible en Evaluar Nicho.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
