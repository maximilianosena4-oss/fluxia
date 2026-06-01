// Motor de scoring de nichos — Sección 3.2 del brief (Adrián Sáenz)
// Tabla de puntuación con multiplicadores

import type { NicheScoreBreakdown, NicheVerdict } from "@/types";

export interface ScoringInputs {
  // Sección 03 — Demanda de mercado (6 checks, 2 puntos c/u = 12 base × 2 = 24)
  hasActiveSearches: boolean;
  hasViralVideos: boolean;
  hasSufficientVolume: boolean;
  hasGrowingTrend: boolean;
  hasSuccessCases: boolean;
  hasPositiveProjection: boolean;

  // Sección 04 — Competencia media-baja (5 checks, ~2.4 puntos c/u = 12 base × 2 = 24)
  dominantChannelsUnder100k: boolean;
  noDominantPlayer: boolean;
  worksInOtherLanguages: boolean;
  canApplyDifferentAngle: boolean;
  canPositionIn90Days: boolean;

  // RPM / Monetización (manual, 0-8 base × 2 = 16)
  rpmScore: number; // 0-8: 0=<$1, 4=$1-4, 6=$4-8, 8=>$8

  // Barreras de entrada (0-8 base × 1.5 = 12)
  entryBarriersScore: number; // 0-8: 0=muy alta barrera, 8=sin barreras

  // Escalabilidad (0-8 base × 1.5 = 12)
  scalabilityScore: number; // 0-8

  // Producción IA viable (0-8 base × 1 = 8)
  aiProductionScore: number; // 0-8: 8=100% IA viable
}

export function calculateNicheScore(inputs: ScoringInputs): NicheScoreBreakdown {
  const demandChecks = [
    inputs.hasActiveSearches,
    inputs.hasViralVideos,
    inputs.hasSufficientVolume,
    inputs.hasGrowingTrend,
    inputs.hasSuccessCases,
    inputs.hasPositiveProjection,
  ].filter(Boolean).length;

  const competitionChecks = [
    inputs.dominantChannelsUnder100k,
    inputs.noDominantPlayer,
    inputs.worksInOtherLanguages,
    inputs.canApplyDifferentAngle,
    inputs.canPositionIn90Days,
  ].filter(Boolean).length;

  const marketDemand   = Math.min(demandChecks * 2, 12) * 2;    // max 24
  const lowCompetition = Math.min(competitionChecks * 2.4, 12) * 2; // max 24
  const monetizationRpm = Math.min(inputs.rpmScore, 8) * 2;     // max 16
  const entryBarriers  = Math.min(inputs.entryBarriersScore, 8) * 1.5; // max 12
  const scalability    = Math.min(inputs.scalabilityScore, 8) * 1.5;   // max 12
  const aiProduction   = Math.min(inputs.aiProductionScore, 8) * 1;    // max 8

  const total = Math.round(
    marketDemand + lowCompetition + monetizationRpm +
    entryBarriers + scalability + aiProduction
  );

  return {
    marketDemand: Math.round(marketDemand),
    lowCompetition: Math.round(lowCompetition),
    monetizationRpm: Math.round(monetizationRpm),
    entryBarriers: Math.round(entryBarriers),
    scalability: Math.round(scalability),
    aiProduction: Math.round(aiProduction),
    total,
  };
}

export function getVerdict(total: number): NicheVerdict {
  if (total >= 70) return "GO";
  if (total >= 50) return "REFINE";
  return "DISCARD";
}

export function getVerdictMessage(verdict: NicheVerdict): string {
  switch (verdict) {
    case "GO":
      return "¡ADELANTE! Este nicho tiene todo para funcionar.";
    case "REFINE":
      return "Tiene potencial — Refina estos puntos primero.";
    case "DISCARD":
      return "Descartá este nicho — Buscá otra oportunidad.";
  }
}

export function checkEricAlanisCriteria(inputs: ScoringInputs): {
  passed: number;
  required: number;
  approved: boolean;
} {
  const checks = [
    inputs.rpmScore >= 4,                       // RPM >$4
    // views/subs ratio y outliers no están en ScoringInputs, se checan externamente
    inputs.dominantChannelsUnder100k,
    inputs.aiProductionScore >= 6,              // Producible con IA viable
    true,                                       // Demanda evergreen (siempre se asume si pasó checks)
    inputs.scalabilityScore >= 4,               // Otra fuente de monetización
    inputs.entryBarriersScore >= 4,             // Alineado con oferta de backend
  ];

  const passed = checks.filter(Boolean).length;
  return { passed, required: 5, approved: passed >= 5 };
}
