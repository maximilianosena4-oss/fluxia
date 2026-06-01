import { auth } from "@/auth";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { DailyInsight } from "@/components/dashboard/DailyInsight";
import { ActionItem } from "@/components/dashboard/ActionItem";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

// Datos iniciales de ejemplo hasta que el usuario complete evaluación
const DEFAULT_ACTION_ITEMS = [
  {
    id: "a1", phase: 0,
    description: "Completar evaluación de nicho en el Evaluador",
    estimatedTime: "10 min", tool: "NEXUS Evaluador",
  },
  {
    id: "a2", phase: 0,
    description: "Validar nicho en viralyt.ai (Outlier Test manual)",
    estimatedTime: "15 min", tool: "viralyt.ai",
  },
  {
    id: "a3", phase: 0,
    description: "Identificar 10 mejores canales de referencia en tu nicho",
    estimatedTime: "20 min", tool: "YouTube",
  },
  {
    id: "a4", phase: 0,
    description: "Diseñar la oferta backend ANTES de crear el canal (Hormozi)",
    estimatedTime: "30 min", tool: "Notion / papel",
  },
  {
    id: "a5", phase: 1,
    description: "Crear canal de YouTube con configuración completa",
    estimatedTime: "45 min", tool: "YouTube Studio",
  },
];

export default async function DashboardPage() {
  const session = await auth();
  const userName = session?.user?.name?.split(" ")[0] ?? "ahí";

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Hero motivacional */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Bienvenido, {userName} 👋
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Tu canal de YouTube que genera ingresos. Paso a paso, con IA.
        </p>
      </div>

      {/* Progress bar global */}
      <div
        className="rounded-xl p-5 border"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border-default)",
        }}
      >
        <ProgressBar
          value={0}
          label="Progreso del Roadmap"
          color="var(--accent-primary)"
          height={10}
        />
        <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
          Completá la evaluación de nicho para comenzar
        </p>
      </div>

      {/* 4 Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsCard
          title="Puntuación Nicho"
          value={null}
          unit="/96"
          subtitle="Sin evaluar aún"
          trend="neutral"
          accentColor="var(--accent-primary)"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          }
        />
        <MetricsCard
          title="Videos Publicados"
          value={0}
          subtitle="¡Publicá el primero!"
          trend="neutral"
          accentColor="var(--accent-secondary)"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          }
        />
        <MetricsCard
          title="Días para Monetizar"
          value={null}
          subtitle="Objetivo: 90 días"
          trend="neutral"
          accentColor="var(--accent-warning)"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          }
        />
        <MetricsCard
          title="Ingresos (90d)"
          value={null}
          unit="USD"
          subtitle="Proyección a 90 días"
          trend="neutral"
          accentColor="var(--accent-success)"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          }
        />
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Acciones pendientes */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>
              Acciones pendientes
            </h2>
            <span className="text-xs px-2 py-1 rounded-full" style={{
              backgroundColor: "var(--bg-card)",
              color: "var(--text-muted)",
            }}>
              Fase 0 — Validación
            </span>
          </div>

          <div className="space-y-2">
            {DEFAULT_ACTION_ITEMS.map((item) => (
              <ActionItem key={item.id} {...item} />
            ))}
          </div>

          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href="/dashboard/roadmap">Ver roadmap completo →</Link>
          </Button>
        </div>

        {/* Sidebar derecho */}
        <div className="space-y-4">
          <DailyInsight />

          {/* CTA — próxima acción */}
          <div
            className="rounded-xl p-5 border space-y-3"
            style={{
              background: "linear-gradient(135deg, var(--accent-primary)20, var(--accent-secondary)10)",
              borderColor: "var(--border-accent)",
            }}
          >
            <div>
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--accent-primary)" }}>
                Tu próxima acción
              </p>
              <h3 className="mt-1 font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                Evaluar tu nicho
              </h3>
              <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                10 minutos. Resultado inmediato. Es el primer paso que define todo.
              </p>
            </div>
            <Button asChild size="sm" className="w-full">
              <Link href="/dashboard/evaluator">
                Evaluar nicho ahora →
              </Link>
            </Button>
          </div>

          {/* Quick link al consultor */}
          <div
            className="rounded-xl p-4 border"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border-default)",
            }}
          >
            <p className="text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
              ¿Tenés dudas?
            </p>
            <Button asChild variant="secondary" size="sm" className="w-full">
              <Link href="/dashboard/consultant">
                Preguntale a NEXUS
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
