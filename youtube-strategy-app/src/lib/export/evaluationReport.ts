// Genera un reporte de texto descargable de la evaluación de nicho

import type { NicheScoreBreakdown, NicheVerdict } from "@/types";

interface ReportData {
  nicheName: string;
  subNiche?: string;
  language: string;
  channelType: string;
  score: NicheScoreBreakdown;
  verdict: NicheVerdict;
  recommendation: string;
  evaluationDate: string;
  riskFlags?: string[];
}

export function generateEvaluationReport(data: ReportData): string {
  const stars = (n: number, max: number) => {
    const filled = Math.round((n / max) * 5);
    return "★".repeat(filled) + "☆".repeat(5 - filled);
  };

  const verdictEmoji = data.verdict === "GO" ? "✅" : data.verdict === "REFINE" ? "⚠️" : "❌";
  const verdictLabel = data.verdict === "GO" ? "ADELANTE" : data.verdict === "REFINE" ? "REFINAR" : "DESCARTAR";

  return `
╔══════════════════════════════════════════════════════════════╗
║           REPORTE DE EVALUACIÓN DE NICHO — NEXUS             ║
╚══════════════════════════════════════════════════════════════╝

Fecha: ${data.evaluationDate}
Nicho: ${data.nicheName}${data.subNiche ? ` › ${data.subNiche}` : ""}
Idioma: ${data.language} | Tipo de canal: ${data.channelType}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VEREDICTO: ${verdictEmoji} ${verdictLabel}
Puntuación total: ${data.score.total}/96 puntos

${data.recommendation}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DESGLOSE DEL SCORING:

  Demanda de mercado     ${String(data.score.marketDemand).padStart(2)}/24 pts  ${stars(data.score.marketDemand, 24)}
  Competencia baja       ${String(data.score.lowCompetition).padStart(2)}/24 pts  ${stars(data.score.lowCompetition, 24)}
  RPM / Monetización     ${String(data.score.monetizationRpm).padStart(2)}/16 pts  ${stars(data.score.monetizationRpm, 16)}
  Barreras de entrada    ${String(data.score.entryBarriers).padStart(2)}/12 pts  ${stars(data.score.entryBarriers, 12)}
  Escalabilidad          ${String(data.score.scalability).padStart(2)}/12 pts  ${stars(data.score.scalability, 12)}
  Producción con IA      ${String(data.score.aiProduction).padStart(2)}/8  pts  ${stars(data.score.aiProduction, 8)}
  ─────────────────────────────────────────────────────
  TOTAL                  ${String(data.score.total).padStart(2)}/96 pts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ESCALA DE REFERENCIA:
  ≥ 70 puntos → ✅ ADELANTE — Este nicho tiene todo para funcionar
  50-69 puntos → ⚠️ REFINAR — Tiene potencial, pero mejorá estos puntos
  < 50 puntos  → ❌ DESCARTAR — Buscá otra oportunidad

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${data.riskFlags && data.riskFlags.length > 0 ? `
ALERTAS DE RIESGO DETECTADAS:
${data.riskFlags.map((f) => `  ⚠️  ${f}`).join("\n")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
` : ""}
PRÓXIMOS PASOS RECOMENDADOS:

${data.verdict === "GO" ? `  1. Validar en viralyt.ai para confirmar outliers
  2. Identificar los 10 mejores canales de referencia
  3. Aplicar Outlier Test a los 3 canales top
  4. Diseñar la oferta backend (Alex Hormozi) ANTES del canal
  5. Crear el canal y publicar el primer video` : data.verdict === "REFINE" ? `  1. Revisar los criterios con score más bajo en el desglose
  2. Buscar un sub-nicho más específico con menos competencia
  3. Investigar el potencial de RPM del nicho
  4. Re-evaluar con NEXUS después de los ajustes` : `  1. No invertir tiempo ni dinero en este nicho
  2. Buscar un nicho con mayor demanda y menor competencia
  3. Usar el Consultor NEXUS para explorar alternativas
  4. Recordar: el nicho correcto es el 80% del éxito`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Basado en metodologías de:
  • Eloisa Wolf (@EloisaWolf) — RPM y monetización
  • Adrián Sáenz (@AdrianSaenz) — Proceso Nicho→Monetización
  • Eric Alanis (@ericalanisyt) — Canal sin rostro + IA
  • Alex Hormozi (@AlexHormozi) — Oferta primero
  • MrBeast (@MrBeast) — Outlier Test + Packaging

Generado con NEXUS — YouTube Strategy Consultant
`.trim();
}

export function downloadReport(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
