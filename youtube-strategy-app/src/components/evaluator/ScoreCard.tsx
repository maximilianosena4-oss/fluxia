"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";

function useCountUp(target: number, duration = 1200): number {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    const start = Date.now();
    function tick() {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.round(target * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);
  return count;
}
import type { NicheScoreBreakdown, NicheVerdict } from "@/types";
import { getVerdictMessage, checkEricAlanisCriteria } from "@/lib/scoring/nicheScore";
import { generateEvaluationReport, downloadReport } from "@/lib/export/evaluationReport";
import { Button } from "@/components/ui/button";
import { useEvaluatorStore } from "@/store/useEvaluatorStore";

interface ScoreCardProps {
  score: NicheScoreBreakdown;
  verdict: NicheVerdict;
  nicheName: string;
  language?: string;
  channelType?: string;
}

const CRITERIA = [
  { key: "marketDemand",    label: "Demanda de mercado",   max: 24, color: "var(--accent-primary)" },
  { key: "lowCompetition",  label: "Competencia baja",     max: 24, color: "var(--accent-secondary)" },
  { key: "monetizationRpm", label: "RPM / Monetización",   max: 16, color: "var(--accent-success)" },
  { key: "entryBarriers",   label: "Barreras de entrada",  max: 12, color: "var(--accent-warning)" },
  { key: "scalability",     label: "Escalabilidad",        max: 12, color: "var(--accent-warning)" },
  { key: "aiProduction",    label: "Producción con IA",    max: 8,  color: "var(--accent-primary)" },
] as const;

const VERDICT_CONFIG: Record<NicheVerdict, { bg: string; border: string; emoji: string; scoreColor: string }> = {
  GO:      { bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.3)",  emoji: "🚀", scoreColor: "var(--accent-success)" },
  REFINE:  { bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.3)",  emoji: "⚡", scoreColor: "var(--accent-warning)" },
  DISCARD: { bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.3)",   emoji: "❌", scoreColor: "var(--accent-danger)" },
};

export function ScoreCard({ score, verdict, nicheName, language = "ES", channelType = "no-face-ai" }: ScoreCardProps) {
  const cfg = VERDICT_CONFIG[verdict];
  const [downloading, setDownloading] = useState(false);
  const [showAlanis, setShowAlanis] = useState(false);
  const animatedScore = useCountUp(score.total, 1200);
  const router = useRouter();
  const scoringInputs = useEvaluatorStore((s) => s.scoringInputs);
  const alanisResult = checkEricAlanisCriteria({
    hasActiveSearches:       scoringInputs.hasActiveSearches      ?? true,
    hasViralVideos:          scoringInputs.hasViralVideos         ?? false,
    hasSufficientVolume:     scoringInputs.hasSufficientVolume    ?? true,
    hasGrowingTrend:         scoringInputs.hasGrowingTrend        ?? true,
    hasSuccessCases:         scoringInputs.hasSuccessCases        ?? false,
    hasPositiveProjection:   scoringInputs.hasPositiveProjection  ?? true,
    dominantChannelsUnder100k: scoringInputs.dominantChannelsUnder100k ?? true,
    noDominantPlayer:        scoringInputs.noDominantPlayer       ?? true,
    worksInOtherLanguages:   scoringInputs.worksInOtherLanguages  ?? true,
    canApplyDifferentAngle:  scoringInputs.canApplyDifferentAngle ?? true,
    canPositionIn90Days:     scoringInputs.canPositionIn90Days    ?? true,
    rpmScore:                scoringInputs.rpmScore               ?? 4,
    entryBarriersScore:      scoringInputs.entryBarriersScore     ?? 5,
    scalabilityScore:        scoringInputs.scalabilityScore       ?? 5,
    aiProductionScore:       scoringInputs.aiProductionScore      ?? 6,
  });

  function handleExport() {
    setDownloading(true);
    try {
      const report = generateEvaluationReport({
        nicheName,
        language,
        channelType,
        score,
        verdict,
        recommendation: getVerdictMessage(verdict),
        evaluationDate: new Date().toLocaleDateString("es-AR", {
          day: "numeric", month: "long", year: "numeric",
        }),
      });
      const slug = nicheName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const date = new Date().toISOString().split("T")[0];
      downloadReport(report, `NEXUS_evaluacion_${slug}_${date}.txt`);
      toast.success("Reporte descargado");
    } catch {
      toast.error("Error al generar el reporte");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Score principal animado */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="rounded-2xl p-6 text-center border"
        style={{
          backgroundColor: cfg.bg,
          borderColor: cfg.border,
          boxShadow: `0 0 40px ${cfg.border}60, inset 0 1px 0 rgba(255,255,255,0.05)`,
        }}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", delay: 0.1, duration: 0.5 }}
          className="text-5xl mb-3"
        >
          {cfg.emoji}
        </motion.div>
        <motion.div
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2, duration: 0.6 }}
          className="text-7xl font-black tabular-nums mb-1 leading-none"
          style={{
            color: cfg.scoreColor,
            textShadow: `0 0 30px ${cfg.scoreColor}60`,
          }}
        >
          {animatedScore}
        </motion.div>
        <div className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
          puntos de 96 máximos
        </div>
        <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
          &ldquo;{nicheName}&rdquo;
        </h3>
        <p className="mt-2 text-sm font-semibold" style={{ color: cfg.scoreColor }}>
          {getVerdictMessage(verdict)}
        </p>
      </motion.div>

      {/* Desglose animado */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border-default)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: "var(--bg-card)" }}>
              <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--text-muted)" }}>Criterio</th>
              <th className="text-right px-4 py-3 font-medium" style={{ color: "var(--text-muted)" }}>Puntaje</th>
              <th className="text-right px-4 py-3 font-medium" style={{ color: "var(--text-muted)" }}>Máximo</th>
            </tr>
          </thead>
          <tbody>
            {CRITERIA.map((c, i) => {
              const value = score[c.key];
              const pct = (value / c.max) * 100;
              return (
                <motion.tr
                  key={c.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  style={{ backgroundColor: i % 2 === 0 ? "var(--bg-secondary)" : "var(--bg-card)" }}
                >
                  <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                      {c.label}
                    </div>
                    <div className="mt-1.5 w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-primary)" }}>
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 + 0.3, ease: "easeOut" }}
                        style={{ backgroundColor: c.color }}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-bold tabular-nums" style={{ color: c.color }}>
                    {value}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums" style={{ color: "var(--text-muted)" }}>
                    {c.max}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ backgroundColor: "var(--bg-primary)" }}>
              <td className="px-4 py-3 font-bold" style={{ color: "var(--text-primary)" }}>TOTAL</td>
              <td className="px-4 py-3 text-right font-black text-lg tabular-nums" style={{ color: cfg.scoreColor }}>
                {score.total}
              </td>
              <td className="px-4 py-3 text-right font-bold" style={{ color: "var(--text-muted)" }}>96</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Criterios Eric Alanis */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: alanisResult.approved ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)" }}
      >
        <button
          onClick={() => setShowAlanis((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-left"
          style={{ backgroundColor: alanisResult.approved ? "rgba(16,185,129,0.08)" : "rgba(245,158,11,0.08)" }}
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">{alanisResult.approved ? "✅" : "⚠️"}</span>
            <div>
              <p className="text-sm font-semibold" style={{ color: alanisResult.approved ? "var(--accent-success)" : "var(--accent-warning)" }}>
                Criterios Eric Alanis — {alanisResult.passed}/{alanisResult.required} mínimos
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {alanisResult.approved ? "Nicho aprobado para canal sin rostro" : "Revisá los criterios pendientes"}
              </p>
            </div>
          </div>
          <svg
            className="w-4 h-4 flex-shrink-0 transition-transform"
            style={{ color: "var(--text-muted)", transform: showAlanis ? "rotate(180deg)" : "rotate(0deg)" }}
            fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
          </svg>
        </button>
        {showAlanis && (
          <div className="px-4 pb-4 pt-2 space-y-1.5" style={{ backgroundColor: "var(--bg-card)" }}>
            {[
              { label: "RPM > $4 USD en hispanohablante",           ok: (scoringInputs.rpmScore ?? 4) >= 4 },
              { label: "Canales dominantes < 100K subs",            ok: scoringInputs.dominantChannelsUnder100k ?? true },
              { label: "Producción viable con IA (score ≥ 6/8)",    ok: (scoringInputs.aiProductionScore ?? 6) >= 6 },
              { label: "Demanda evergreen activa",                   ok: scoringInputs.hasActiveSearches ?? true },
              { label: "Escalabilidad ≥ media (score ≥ 4/8)",       ok: (scoringInputs.scalabilityScore ?? 5) >= 4 },
              { label: "Alineado con oferta de backend (barreras ≥ 4)", ok: (scoringInputs.entryBarriersScore ?? 5) >= 4 },
            ].map((c) => (
              <div key={c.label} className="flex items-center gap-2 text-sm">
                <span style={{ color: c.ok ? "var(--accent-success)" : "var(--text-muted)" }}>
                  {c.ok ? "✓" : "○"}
                </span>
                <span style={{ color: c.ok ? "var(--text-primary)" : "var(--text-muted)" }}>
                  {c.label}
                </span>
              </div>
            ))}
            <p className="text-xs pt-2" style={{ color: "var(--text-muted)" }}>
              Mínimo 5 de 6 criterios para aprobación de canal sin rostro. (Eric Alanis)
            </p>
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleExport} loading={downloading} variant="secondary" size="sm">
          📄 Descargar reporte
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            const text = `Evalué mi nicho "${nicheName}" con NEXUS: ${score.total}/96 pts. ${getVerdictMessage(verdict)}`;
            void navigator.clipboard.writeText(text);
            toast.success("Resultado copiado");
          }}
        >
          📋 Copiar resultado
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/dashboard/comparator")}
        >
          ⚖️ Comparar con otro nicho
        </Button>
      </div>
    </div>
  );
}
