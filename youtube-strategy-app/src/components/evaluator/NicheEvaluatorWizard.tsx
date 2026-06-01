"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WizardStep } from "./WizardStep";
import { ScoreCard } from "./ScoreCard";
import { Button } from "@/components/ui/button";
import {
  useEvaluatorStore,
  type ChannelType,
  type ContentLanguage,
  type RiskFlags,
} from "@/store/useEvaluatorStore";
import {
  calculateNicheScore,
  getVerdict,
  type ScoringInputs,
} from "@/lib/scoring/nicheScore";
import type { NicheScoreBreakdown, NicheVerdict } from "@/types";

const CHANNEL_TYPE_OPTIONS: Array<{ value: ChannelType; label: string; icon: string; desc: string }> = [
  { value: "no-face-ai", label: "Sin cara con IA",    icon: "🤖", desc: "100% automatizable" },
  { value: "voice-only", label: "Con mi voz",         icon: "🎙️", desc: "Narración propia" },
  { value: "with-face",  label: "Con mi cara",        icon: "🎥", desc: "Máxima conexión" },
];

const LANGUAGES: Array<{ value: ContentLanguage; label: string }> = [
  { value: "ES", label: "🇦🇷 Español" },
  { value: "EN", label: "🇺🇸 Inglés" },
  { value: "PT", label: "🇧🇷 Portugués" },
  { value: "FR", label: "🇫🇷 Francés" },
];

const RISK_FLAGS_CONFIG: Array<{ key: keyof RiskFlags; label: string; reason: string }> = [
  { key: "seduction",               label: "Seducción / Contenido sexual", reason: "Penalización Yellow / No monetizable" },
  { key: "compilationsNoNarrative", label: "Recopilaciones sin narrativa",  reason: "Copyright + baja retención" },
  { key: "noEvergreen",             label: "Contenido sin evergreen",       reason: "Sin tráfico sostenido" },
  { key: "musicDance",              label: "Música / Dance / Lip sync",     reason: "RPM bajísimo" },
  { key: "goreCrime",               label: "Gore / Muertes / Sangre",       reason: "Restricción total de anuncios" },
  { key: "copyrightRisk",           label: "Riesgo alto de copyright",      reason: "Reclamaciones — canal en riesgo" },
];

export function NicheEvaluatorWizard() {
  const router = useRouter();
  const store = useEvaluatorStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  async function runAnalysis() {
    setIsAnalyzing(true);
    setAnalysisError(null);
    store.setLoading(true);

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche: store.nicheName,
          subNiche: store.subNiche,
          language: store.language,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        store.updateScoringInputs(data.inputs as Partial<ScoringInputs>);
      }
    } catch {
      // Si falla el análisis, continuamos con scoring manual
    } finally {
      setIsAnalyzing(false);
      store.setLoading(false);
    }
  }

  async function saveToDb(score: NicheScoreBreakdown, verdict: NicheVerdict) {
    try {
      await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nicheName: store.nicheName,
          criteriaJson: { ...store.scoringInputs, riskFlags: store.riskFlags, channelType: store.channelType },
          totalScore: score.total,
          recommendation: `${verdict}: ${store.nicheName} — Score ${score.total}/96`,
        }),
      });
    } catch {
      // No bloquear el flujo si falla el guardado
    }
  }

  function computeScore(): { score: NicheScoreBreakdown; verdict: NicheVerdict } {
    const inputs: ScoringInputs = {
      hasActiveSearches:      store.scoringInputs.hasActiveSearches      ?? true,
      hasViralVideos:         store.scoringInputs.hasViralVideos         ?? false,
      hasSufficientVolume:    store.scoringInputs.hasSufficientVolume    ?? true,
      hasGrowingTrend:        store.scoringInputs.hasGrowingTrend        ?? true,
      hasSuccessCases:        store.scoringInputs.hasSuccessCases        ?? false,
      hasPositiveProjection:  store.scoringInputs.hasPositiveProjection  ?? true,
      dominantChannelsUnder100k: store.scoringInputs.dominantChannelsUnder100k ?? true,
      noDominantPlayer:       store.scoringInputs.noDominantPlayer       ?? true,
      worksInOtherLanguages:  store.scoringInputs.worksInOtherLanguages  ?? true,
      canApplyDifferentAngle: store.scoringInputs.canApplyDifferentAngle ?? true,
      canPositionIn90Days:    store.scoringInputs.canPositionIn90Days    ?? true,
      rpmScore:               store.scoringInputs.rpmScore               ?? 4,
      entryBarriersScore:     store.scoringInputs.entryBarriersScore     ?? 5,
      scalabilityScore:       store.scoringInputs.scalabilityScore       ?? 5,
      aiProductionScore:      store.scoringInputs.aiProductionScore      ?? 6,
    };
    const score = calculateNicheScore(inputs);
    const verdict = getVerdict(score.total);
    return { score, verdict };
  }

  const hasRiskFlags = Object.values(store.riskFlags).some(Boolean);

  // ─── PASO 1 — Identificación ───────────────────────────────
  if (store.currentStep === 1) {
    return (
      <WizardStep step={1} totalSteps={5} title="¿Cuál es tu nicho?" subtitle="Sé específico. Un sub-nicho claro = menos competencia.">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Nombre del nicho *
            </label>
            <input
              type="text"
              value={store.nicheName}
              onChange={(e) => store.updateStep1({ nicheName: e.target.value })}
              placeholder="ej: Finanzas personales para millennials"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none border transition-colors"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border-default)",
                color: "var(--text-primary)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent-primary)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Sub-nicho específico
            </label>
            <input
              type="text"
              value={store.subNiche}
              onChange={(e) => store.updateStep1({ subNiche: e.target.value })}
              placeholder="ej: Inversión en ETFs para personas sin experiencia"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none border transition-colors"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border-default)",
                color: "var(--text-primary)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent-primary)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Idioma principal
            </label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((l) => (
                <button
                  key={l.value}
                  onClick={() => store.updateStep1({ language: l.value })}
                  className="px-4 py-2 rounded-lg text-sm font-medium border transition-all"
                  style={{
                    backgroundColor: store.language === l.value ? "var(--accent-primary)" : "var(--bg-secondary)",
                    borderColor: store.language === l.value ? "var(--accent-primary)" : "var(--border-default)",
                    color: store.language === l.value ? "white" : "var(--text-secondary)",
                  }}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Tipo de canal
            </label>
            <div className="grid grid-cols-3 gap-3">
              {CHANNEL_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => store.updateStep1({ channelType: opt.value })}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all"
                  style={{
                    backgroundColor: store.channelType === opt.value ? "rgba(99,102,241,0.1)" : "var(--bg-secondary)",
                    borderColor: store.channelType === opt.value ? "var(--accent-primary)" : "var(--border-default)",
                  }}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                    {opt.label}
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {opt.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              ¿Por qué creés que este nicho va a funcionar?
            </label>
            <textarea
              value={store.whyThisNiche}
              onChange={(e) => store.updateStep1({ whyThisNiche: e.target.value })}
              rows={3}
              placeholder="Contame brevemente tu razonamiento..."
              className="w-full px-4 py-3 rounded-xl text-sm outline-none border resize-none transition-colors"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border-default)",
                color: "var(--text-primary)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent-primary)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={store.nextStep}
              disabled={store.nicheName.trim().length < 3}
              size="lg"
            >
              Continuar →
            </Button>
          </div>
        </div>
      </WizardStep>
    );
  }

  // ─── PASO 2 — Riesgos ──────────────────────────────────────
  if (store.currentStep === 2) {
    return (
      <WizardStep step={2} totalSteps={5} title="Verificación de riesgos" subtitle="Marcá si tu nicho tiene alguno de estos problemas. Podés continuar igualmente.">
        <div className="space-y-4">
          {RISK_FLAGS_CONFIG.map((flag) => {
            const isActive = store.riskFlags[flag.key];
            return (
              <button
                key={flag.key}
                onClick={() => store.updateRiskFlags({ [flag.key]: !isActive })}
                className="w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all"
                style={{
                  backgroundColor: isActive ? "rgba(239,68,68,0.1)" : "var(--bg-secondary)",
                  borderColor: isActive ? "rgba(239,68,68,0.4)" : "var(--border-default)",
                }}
              >
                <div
                  className="mt-0.5 w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border-2"
                  style={{
                    backgroundColor: isActive ? "var(--accent-danger)" : "transparent",
                    borderColor: isActive ? "var(--accent-danger)" : "var(--text-muted)",
                  }}
                >
                  {isActive && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {flag.label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: isActive ? "var(--accent-danger)" : "var(--text-muted)" }}>
                    ⚠ {flag.reason}
                  </p>
                </div>
              </button>
            );
          })}

          {hasRiskFlags && (
            <div
              className="rounded-xl p-4 border"
              style={{
                backgroundColor: "rgba(245,158,11,0.1)",
                borderColor: "rgba(245,158,11,0.3)",
              }}
            >
              <p className="text-sm font-medium" style={{ color: "var(--accent-warning)" }}>
                ⚡ Tenés riesgos seleccionados. Se descontarán puntos del scoring.
              </p>
            </div>
          )}

          <div className="flex justify-between pt-2">
            <Button variant="ghost" onClick={store.prevStep}>
              ← Atrás
            </Button>
            <Button onClick={() => { store.nextStep(); void runAnalysis(); }} size="lg">
              Analizar demanda →
            </Button>
          </div>
        </div>
      </WizardStep>
    );
  }

  // ─── PASO 3 — Demanda de mercado ───────────────────────────
  if (store.currentStep === 3) {
    const checks = [
      { key: "hasActiveSearches",     label: "Hay búsquedas activas en YouTube" },
      { key: "hasViralVideos",        label: "Existen videos virales (1-2M+ vistas)" },
      { key: "hasSufficientVolume",   label: "Volumen suficiente en el idioma seleccionado" },
      { key: "hasGrowingTrend",       label: "Videos recientes siguen creciendo" },
      { key: "hasSuccessCases",       label: "Existen casos de éxito documentados" },
      { key: "hasPositiveProjection", label: "Proyección positiva a 1-2 años" },
    ] as const;

    return (
      <WizardStep step={3} totalSteps={5} title="Demanda del mercado" subtitle="IA analizando YouTube en tiempo real...">
        <div className="space-y-4">
          {isAnalyzing && (
            <div
              className="flex items-center gap-3 p-4 rounded-xl border"
              style={{
                backgroundColor: "rgba(99,102,241,0.1)",
                borderColor: "var(--border-accent)",
              }}
            >
              <svg className="w-4 h-4 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24" style={{ color: "var(--accent-primary)" }}>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm" style={{ color: "var(--accent-primary)" }}>
                Buscando en YouTube API...
              </span>
            </div>
          )}

          {analysisError && (
            <div
              className="p-3 rounded-lg text-sm"
              style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "var(--accent-danger)" }}
            >
              {analysisError}
            </div>
          )}

          <div className="space-y-2">
            {checks.map((check) => {
              const value = store.scoringInputs[check.key] ?? false;
              return (
                <button
                  key={check.key}
                  onClick={() => store.updateScoringInputs({ [check.key]: !value })}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all"
                  style={{
                    backgroundColor: value ? "rgba(16,185,129,0.1)" : "var(--bg-secondary)",
                    borderColor: value ? "rgba(16,185,129,0.3)" : "var(--border-default)",
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-300"
                    style={{
                      backgroundColor: value ? "var(--accent-success)" : "var(--bg-card)",
                      border: `2px solid ${value ? "var(--accent-success)" : "var(--text-muted)"}`,
                    }}
                  >
                    {value && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm" style={{ color: value ? "var(--text-primary)" : "var(--text-secondary)" }}>
                    {check.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="ghost" onClick={store.prevStep}>← Atrás</Button>
            <Button onClick={store.nextStep} size="lg">Ver competencia →</Button>
          </div>
        </div>
      </WizardStep>
    );
  }

  // ─── PASO 4 — Competencia ──────────────────────────────────
  if (store.currentStep === 4) {
    const checks = [
      { key: "dominantChannelsUnder100k", label: "Canales dominantes tienen menos de 100K subs" },
      { key: "noDominantPlayer",          label: "No hay nadie que domine sin competencia real" },
      { key: "worksInOtherLanguages",     label: "Funciona también en inglés/otros idiomas" },
      { key: "canApplyDifferentAngle",    label: "Podés aplicar un ángulo diferente al existente" },
      { key: "canPositionIn90Days",       label: "Es posible posicionarse desde 0 en 90 días" },
    ] as const;

    const rpmOptions = [
      { value: 0, label: "$0-1 USD",  desc: "Entretenimiento/música" },
      { value: 2, label: "$1-4 USD",  desc: "Lifestyle/general" },
      { value: 5, label: "$4-8 USD",  desc: "Finanzas/Tech" },
      { value: 8, label: ">$8 USD",   desc: "Legal/Seguros/Finanzas premium" },
    ];

    return (
      <WizardStep step={4} totalSteps={5} title="Análisis de competencia" subtitle="¿Qué tan difícil es entrar a este nicho?">
        <div className="space-y-6">
          <div className="space-y-2">
            {checks.map((check) => {
              const value = store.scoringInputs[check.key] ?? false;
              return (
                <button
                  key={check.key}
                  onClick={() => store.updateScoringInputs({ [check.key]: !value })}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all"
                  style={{
                    backgroundColor: value ? "rgba(99,102,241,0.1)" : "var(--bg-secondary)",
                    borderColor: value ? "var(--border-accent)" : "var(--border-default)",
                  }}
                >
                  <div
                    className="w-5 h-5 rounded flex-shrink-0 flex items-center justify-center"
                    style={{
                      backgroundColor: value ? "var(--accent-primary)" : "transparent",
                      border: `2px solid ${value ? "var(--accent-primary)" : "var(--text-muted)"}`,
                    }}
                  >
                    {value && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm" style={{ color: "var(--text-primary)" }}>{check.label}</span>
                </button>
              );
            })}
          </div>

          {/* RPM selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              RPM estimado del nicho (ingresos por 1000 vistas)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {rpmOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => store.updateScoringInputs({ rpmScore: opt.value })}
                  className="p-3 rounded-lg border text-left transition-all"
                  style={{
                    backgroundColor: store.scoringInputs.rpmScore === opt.value ? "rgba(16,185,129,0.1)" : "var(--bg-secondary)",
                    borderColor: store.scoringInputs.rpmScore === opt.value ? "var(--accent-success)" : "var(--border-default)",
                  }}
                >
                  <p className="text-sm font-bold" style={{ color: "var(--accent-success)" }}>{opt.label}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="ghost" onClick={store.prevStep}>← Atrás</Button>
            <Button
              size="lg"
              onClick={() => {
                const { score, verdict } = computeScore();
                store.setResult(score, verdict);
                void saveToDb(score, verdict);
                store.nextStep();
              }}
            >
              Ver resultado →
            </Button>
          </div>
        </div>
      </WizardStep>
    );
  }

  // ─── PASO 5 — Veredicto ────────────────────────────────────
  if (store.currentStep === 5 && store.scoreBreakdown && store.verdict) {
    return (
      <WizardStep step={5} totalSteps={5} title="El veredicto" subtitle="Scoring calculado automáticamente con los datos reales.">
        <div className="space-y-6">
          <ScoreCard
            score={store.scoreBreakdown}
            verdict={store.verdict}
            nicheName={store.nicheName}
          />

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="ghost" onClick={store.prevStep} className="flex-1">
              ← Ajustar
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => router.push("/dashboard/consultant?from=evaluator")}
            >
              Consultar a NEXUS
            </Button>
            <Button
              className="flex-1"
              onClick={() => router.push("/dashboard/roadmap")}
            >
              Ver Plan de Acción →
            </Button>
          </div>

          <button
            className="text-xs text-center w-full"
            style={{ color: "var(--text-muted)" }}
            onClick={() => store.reset()}
          >
            Evaluar otro nicho →
          </button>
        </div>
      </WizardStep>
    );
  }

  return null;
}
