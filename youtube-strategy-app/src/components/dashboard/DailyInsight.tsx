"use client";

import type { MentorSource } from "@/types/ai";

const MENTOR_INFO: Record<MentorSource, { name: string; color: string; emoji: string }> = {
  eloisa_wolf:  { name: "Eloisa Wolf",  color: "var(--accent-primary)",   emoji: "📊" },
  adrian_saenz: { name: "Adrián Sáenz", color: "var(--accent-secondary)", emoji: "🎯" },
  eric_alanis:  { name: "Eric Alanis",  color: "var(--accent-success)",   emoji: "🤖" },
  alex_hormozi: { name: "Alex Hormozi", color: "var(--accent-warning)",   emoji: "💰" },
  mrbeast:      { name: "MrBeast",      color: "var(--accent-danger)",    emoji: "🔥" },
};

const DAILY_INSIGHTS: Array<{ mentor: MentorSource; text: string }> = [
  { mentor: "mrbeast",      text: "El thumbnail es el 80% del éxito de tu video. Antes de subir, preguntate: '¿yo haría clic en esto?'" },
  { mentor: "alex_hormozi", text: "Diseñá tu oferta ANTES de crear el canal. El contenido son anuncios gratuitos de tu producto." },
  { mentor: "adrian_saenz", text: "Solo hay 2 métricas que importan al inicio: CTR >4% y Retención >50%. Todo lo demás es ruido." },
  { mentor: "eloisa_wolf",  text: "Videos de más de 8 minutos pueden incluir mid-roll ads. Más tiempo = más ingresos por vista." },
  { mentor: "eric_alanis",  text: "YouTube PENALIZA canales de IA sin valor humano real. Necesitás tu ángulo editorial único." },
  { mentor: "mrbeast",      text: "Outlier Test: si no encontrás videos con 10x el promedio del canal, ese nicho no tiene demanda algorítmica." },
  { mentor: "alex_hormozi", text: "Viralidad = Embudo: Atención → Nutrición → Venta. Sin los tres no hay negocio real." },
];

interface DailyInsightProps {
  dayIndex?: number;
}

export function DailyInsight({ dayIndex }: DailyInsightProps) {
  const idx = dayIndex ?? new Date().getDay();
  const insight = DAILY_INSIGHTS[idx % DAILY_INSIGHTS.length];
  const mentor = MENTOR_INFO[insight.mentor];

  return (
    <div
      className="rounded-xl p-5 border relative overflow-hidden"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderColor: "var(--border-accent)",
      }}
    >
      {/* Background accent */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5 -translate-y-1/2 translate-x-1/2"
        style={{ backgroundColor: mentor.color }}
      />

      <div className="relative space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{mentor.emoji}</span>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Consejo del día
            </p>
            <p className="text-xs font-semibold" style={{ color: mentor.color }}>
              {mentor.name}
            </p>
          </div>
        </div>

        <blockquote
          className="text-sm font-medium leading-relaxed italic"
          style={{ color: "var(--text-primary)" }}
        >
          &ldquo;{insight.text}&rdquo;
        </blockquote>
      </div>
    </div>
  );
}
