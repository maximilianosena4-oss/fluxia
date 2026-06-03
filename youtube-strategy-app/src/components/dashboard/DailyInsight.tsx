"use client";

import type { MentorSource } from "@/types/ai";

const MENTOR_INFO: Record<MentorSource, { name: string; color: string; emoji: string }> = {
  eloisa_wolf:  { name: "Eloisa Wolf",  color: "var(--accent-primary)",   emoji: "📊" },
  adrian_saenz: { name: "Adrián Sáenz", color: "var(--accent-secondary)", emoji: "🎯" },
  eric_alanis:  { name: "Eric Alanis",  color: "var(--accent-success)",   emoji: "🤖" },
  alex_hormozi: { name: "Alex Hormozi", color: "var(--accent-warning)",   emoji: "💰" },
  mrbeast:      { name: "MrBeast",      color: "var(--accent-danger)",    emoji: "🔥" },
};

const DAILY_INSIGHTS: Array<{ mentor: MentorSource; text: string; category: string }> = [
  // ─── MrBeast ──────────────────────────────────────────────
  { mentor: "mrbeast",      category: "Packaging",  text: "El thumbnail es el 80% del éxito de tu video. Antes de subir, preguntate: '¿yo haría clic en esto?'" },
  { mentor: "mrbeast",      category: "Retención",  text: "Los primeros 30 segundos determinan si el video vive o muere. Si no enganchás ahí, el video está muerto." },
  { mentor: "mrbeast",      category: "Estrategia", text: "Outlier Test: si no encontrás videos con 10x el promedio del canal, ese nicho no tiene demanda algorítmica." },
  { mentor: "mrbeast",      category: "Consistencia", text: "Consistencia supera al talento. Publicar seguido supera al talento esporádico — siempre." },
  { mentor: "mrbeast",      category: "Packaging",  text: "Nunca imites a competidores directos. Imitá a los mejores del mundo en OTROS nichos y aplicalo al tuyo." },
  // ─── Alex Hormozi ─────────────────────────────────────────
  { mentor: "alex_hormozi", category: "Oferta",     text: "Diseñá tu oferta ANTES de crear el canal. El contenido son anuncios gratuitos de tu producto." },
  { mentor: "alex_hormozi", category: "Monetización", text: "Construir audiencia sin oferta = trabajo sin retorno económico. Primero la oferta, después el canal." },
  { mentor: "alex_hormozi", category: "Crecimiento", text: "3 palancas de crecimiento: Volumen (más contenido), Calidad (mejor packaging), Distribución (más plataformas)." },
  { mentor: "alex_hormozi", category: "Estrategia", text: "Jerarquía de valor: sueños del cliente > problemas que bloquean esos sueños > soluciones que provees." },
  // ─── Eloisa Wolf ──────────────────────────────────────────
  { mentor: "eloisa_wolf",  category: "RPM",        text: "Videos de más de 8 minutos pueden incluir mid-roll ads. Más tiempo = más ingresos por vista." },
  { mentor: "eloisa_wolf",  category: "Nichos",     text: "El nicho que elegís es el techo de tus ingresos. Finanzas, Tech y Salud tienen RPM de $4-15 USD." },
  { mentor: "eloisa_wolf",  category: "Escala",     text: "Regla 7-11-4: el comprador necesita 7 horas de contenido, 11 puntos de contacto y 4 plataformas antes de comprar." },
  { mentor: "eloisa_wolf",  category: "Diversificación", text: "5 fuentes de ingresos: AdSense, patrocinios, productos digitales, afiliados y membresías. No dependas de una sola." },
  // ─── Adrián Sáenz ─────────────────────────────────────────
  { mentor: "adrian_saenz", category: "Métricas",   text: "Solo hay 2 métricas que importan al inicio: CTR >4% y Retención >50%. Todo lo demás es ruido." },
  { mentor: "adrian_saenz", category: "Proceso",    text: "El proceso completo: Nicho → Tipo de contenido → Packaging → Producción con IA → Monetización." },
  { mentor: "adrian_saenz", category: "Ideas",      text: "Las mejores ideas de nicho vienen de FUERA del nicho, no de adentro. Mirá qué funciona en otros mercados." },
  { mentor: "adrian_saenz", category: "Guión",      text: "Estructura del guión viral: Gancho (0-30s) / Problema / Solución / CTA. Nunca cambies este orden." },
  // ─── Eric Alanis ──────────────────────────────────────────
  { mentor: "eric_alanis",  category: "Sin rostro",  text: "YouTube PENALIZA canales de IA sin valor humano real. Necesitás tu ángulo editorial único." },
  { mentor: "eric_alanis",  category: "Velocidad",   text: "La monetización acelerada es posible: hay canales documentados que lo lograron en 5-13 días con el nicho correcto." },
  { mentor: "eric_alanis",  category: "Validación",  text: "Siempre validá en viralyt.ai antes de producir cualquier contenido. 10 minutos de validación ahorran semanas de trabajo." },
  { mentor: "eric_alanis",  category: "Nichos",      text: "Los 8 nichos sin cara validados tienen RPM mayor a $4 USD: finanzas, historia, tech, salud, ASMR, cripto, idiomas, espiritualidad." },
];

interface DailyInsightProps {
  dayIndex?: number;
}

export function DailyInsight({ dayIndex }: DailyInsightProps) {
  // Usa día del año para ciclar los 21 insights con más variedad
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  const idx = dayIndex ?? dayOfYear;
  const insight = DAILY_INSIGHTS[idx % DAILY_INSIGHTS.length];
  const mentor = MENTOR_INFO[insight.mentor];

  return (
    <div
      className="rounded-xl p-5 border relative overflow-hidden"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderColor: mentor.color + "50",
        animation: "pulse-border 4s ease-in-out infinite",
        boxShadow: `0 0 20px ${mentor.color}10`,
      }}
    >
      {/* Glow de fondo sutil */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at top right, ${mentor.color}, transparent 70%)` }}
      />

      <div className="relative space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{mentor.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Consejo del día
            </p>
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold" style={{ color: mentor.color }}>
                {mentor.name}
              </p>
              <span
                className="text-xs px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: `${mentor.color}18`, color: mentor.color }}
              >
                {insight.category}
              </span>
            </div>
          </div>
        </div>

        <blockquote
          className="text-sm leading-relaxed"
          style={{
            color: "var(--text-primary)",
            borderLeft: `3px solid ${mentor.color}60`,
            paddingLeft: "12px",
            fontStyle: "italic",
          }}
        >
          &ldquo;{insight.text}&rdquo;
        </blockquote>
      </div>
    </div>
  );
}
