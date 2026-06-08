"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// CPM hardcoded por nicho (USD)
const NICHE_CPM: Record<string, { cpm: number; label: string; emoji: string }> = {
  finance:     { cpm: 18.0, label: "Finanzas",           emoji: "💰" },
  crypto:      { cpm: 22.0, label: "Crypto / Inversiones", emoji: "₿" },
  real_estate: { cpm: 15.5, label: "Real Estate",        emoji: "🏠" },
  tech:        { cpm: 9.5,  label: "Tecnología",         emoji: "💻" },
  saas:        { cpm: 14.0, label: "SaaS / B2B",         emoji: "🛠" },
  health:      { cpm: 7.5,  label: "Salud / Fitness",    emoji: "🏋️" },
  education:   { cpm: 6.0,  label: "Educación",          emoji: "📚" },
  gaming:      { cpm: 3.5,  label: "Gaming",             emoji: "🎮" },
  entertainment:{ cpm: 3.0, label: "Entretenimiento",    emoji: "🎭" },
  food:        { cpm: 4.5,  label: "Gastronomía",        emoji: "🍕" },
  travel:      { cpm: 5.5,  label: "Viajes",             emoji: "✈️" },
  beauty:      { cpm: 6.5,  label: "Belleza / Moda",     emoji: "💄" },
  marketing:   { cpm: 12.0, label: "Marketing Digital",  emoji: "📈" },
  productivity:{ cpm: 8.0,  label: "Productividad",      emoji: "⚡" },
};

const MILESTONES = [
  { subs: 1_000,   label: "1K subs", unlock: "Membresías de canal" },
  { subs: 10_000,  label: "10K subs", unlock: "Super Thanks / Clips" },
  { subs: 50_000,  label: "50K subs", unlock: "Patrocinios mid-size ($500–2K/video)" },
  { subs: 100_000, label: "100K subs", unlock: "Silver Play Button · Patrocinios premium" },
  { subs: 500_000, label: "500K subs", unlock: "Marca propia / Merch / Cursos ($10K+/mes)" },
  { subs: 1_000_000, label: "1M subs", unlock: "Gold Play Button · Full-time creador garantizado" },
];

function fmt(n: number, currency = false): string {
  const s = currency ? "$" : "";
  if (n >= 1_000_000) return `${s}${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${s}${(n / 1_000).toFixed(1)}K`;
  return `${s}${n.toFixed(currency ? 0 : 0)}`;
}

interface Projection {
  monthly: number;
  annual: number;
  sponsorEstimate: number;
  totalMonthly: number;
}

function calcProjection(
  views: number,
  cpm: number,
  subs: number
): Projection {
  const monthly = (views * cpm) / 1000;
  const annual = monthly * 12;
  const sponsorEstimate = subs >= 50_000 ? subs * 0.025 : subs >= 10_000 ? subs * 0.01 : 0;
  return { monthly, annual, sponsorEstimate, totalMonthly: monthly + sponsorEstimate / 12 };
}

export function MonetizationOptimizer() {
  const [niche, setNiche] = useState<string>("finance");
  const [monthlyViews, setMonthlyViews] = useState(50000);
  const [subscribers, setSubscribers] = useState(5000);

  const nicheData = NICHE_CPM[niche]!;
  const proj = calcProjection(monthlyViews, nicheData.cpm, subscribers);

  const nextMilestone = MILESTONES.find((m) => m.subs > subscribers);
  const currentMilestone = [...MILESTONES].reverse().find((m) => m.subs <= subscribers);
  const milestoneProgress = nextMilestone
    ? Math.min(100, ((subscribers - (currentMilestone?.subs ?? 0)) / (nextMilestone.subs - (currentMilestone?.subs ?? 0))) * 100)
    : 100;

  return (
    <div className="space-y-6">
      {/* Config */}
      <Card className="p-5 space-y-5" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-card)" }}>
        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Configurá tu canal</p>

        {/* Niche selector */}
        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Nicho</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.entries(NICHE_CPM).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setNiche(key)}
                className="flex items-center gap-2 p-2 rounded-lg text-xs font-medium text-left transition-all"
                style={{
                  backgroundColor: niche === key ? "color-mix(in srgb, var(--color-primary, #a855f7) 15%, transparent)" : "var(--bg-secondary)",
                  border: `1px solid ${niche === key ? "var(--color-primary, #a855f7)" : "var(--border-default)"}`,
                  color: niche === key ? "var(--text-primary)" : "var(--text-secondary)",
                }}
              >
                <span>{val.emoji}</span>
                <span>{val.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                Vistas mensuales
              </label>
              <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{fmt(monthlyViews)}</span>
            </div>
            <input
              type="range"
              min={1000}
              max={10_000_000}
              step={1000}
              value={monthlyViews}
              onChange={(e) => setMonthlyViews(Number(e.target.value))}
              className="w-full accent-purple-500"
            />
            <div className="flex justify-between text-xs" style={{ color: "var(--text-muted)" }}>
              <span>1K</span><span>10M</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                Suscriptores
              </label>
              <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{fmt(subscribers)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={5_000_000}
              step={1000}
              value={subscribers}
              onChange={(e) => setSubscribers(Number(e.target.value))}
              className="w-full accent-purple-500"
            />
            <div className="flex justify-between text-xs" style={{ color: "var(--text-muted)" }}>
              <span>0</span><span>5M</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Income projection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "CPM del nicho", value: `$${nicheData.cpm}`, sub: "por 1.000 vistas" },
          { label: "AdSense mensual", value: fmt(proj.monthly, true), sub: "estimado neto" },
          { label: "Patrocinios/mes", value: fmt(proj.sponsorEstimate / 12, true), sub: subscribers >= 10_000 ? "estimado" : "requiere 10K subs" },
          { label: "Ingreso total/mes", value: fmt(proj.totalMonthly, true), sub: "AdSense + sponsors" },
        ].map((card) => (
          <Card
            key={card.label}
            className="p-4 space-y-1"
            style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-card)" }}
          >
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{card.label}</p>
            <p className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>{card.value}</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{card.sub}</p>
          </Card>
        ))}
      </div>

      {/* Annual card */}
      <Card className="p-5" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-secondary)" }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Proyección anual (solo AdSense)</p>
            <p className="text-3xl font-black mt-1" style={{ color: "var(--text-primary)" }}>{fmt(proj.annual, true)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Nicho: {nicheData.emoji} {nicheData.label}</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>CPM ${nicheData.cpm} · {fmt(monthlyViews)} vistas/mes</p>
          </div>
        </div>
      </Card>

      {/* Milestone tracker */}
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Milestones de monetización</p>
        {MILESTONES.map((m) => {
          const reached = subscribers >= m.subs;
          return (
            <div
              key={m.subs}
              className="flex items-center gap-4 p-3 rounded-xl"
              style={{
                backgroundColor: reached ? "color-mix(in srgb, #22c55e 8%, transparent)" : "var(--bg-card)",
                border: `1px solid ${reached ? "color-mix(in srgb, #22c55e 25%, transparent)" : "var(--border-default)"}`,
              }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                style={{ backgroundColor: reached ? "#22c55e" : "var(--bg-secondary)", color: reached ? "#fff" : "var(--text-muted)" }}
              >
                {reached ? "✓" : "○"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: reached ? "#22c55e" : "var(--text-primary)" }}>{m.label}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{m.unlock}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Next milestone progress */}
      {nextMilestone && (
        <Card className="p-4 space-y-2" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-card)" }}>
          <div className="flex justify-between text-xs">
            <span style={{ color: "var(--text-secondary)" }}>Progreso hacia {nextMilestone.label}</span>
            <span className="font-bold" style={{ color: "var(--text-primary)" }}>{milestoneProgress.toFixed(1)}%</span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-secondary)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${milestoneProgress}%`, backgroundColor: "var(--color-primary, #a855f7)" }}
            />
          </div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Faltan {fmt(nextMilestone.subs - subscribers)} suscriptores para desbloquear: {nextMilestone.unlock}
          </p>
        </Card>
      )}
    </div>
  );
}
