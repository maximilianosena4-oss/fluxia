import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { DailyInsight } from "@/components/dashboard/DailyInsight";
import { ActionItem } from "@/components/dashboard/ActionItem";
import { RoadmapDonut } from "@/components/dashboard/DashboardCharts";
import { QuickAccessGrid } from "@/components/dashboard/QuickAccessGrid";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id ?? "";
  const userName = session?.user?.name?.split(" ")[0] ?? "ahí";

  // Datos reales desde Supabase
  const channel = await prisma.channel.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      nicheEvaluations: { orderBy: { createdAt: "desc" }, take: 1 },
      actionItems: { orderBy: [{ phase: "asc" }, { step: "asc" }] },
      contentIdeas: { where: { status: "published" } },
    },
  });

  const latestEval = channel?.nicheEvaluations[0] ?? null;
  const allItems = channel?.actionItems ?? [];
  const completedItems = allItems.filter((i) => i.completedAt !== null);
  const pendingItems = allItems.filter((i) => i.completedAt === null).slice(0, 5);
  const videosPublished = channel?.contentIdeas.length ?? 0;
  const roadmapProgress = allItems.length > 0
    ? Math.round((completedItems.length / allItems.length) * 100)
    : 0;

  // Calcular días hasta monetización (estimación basada en progreso)
  const daysToMonetization = roadmapProgress > 0
    ? Math.max(1, Math.round(90 * (1 - roadmapProgress / 100)))
    : null;

  // Proyección de ingresos a 90 días (basada en RPM del nicho)
  const nicheScore = latestEval?.totalScore ?? null;
  const projectedRevenue = nicheScore && nicheScore >= 70
    ? Math.round(nicheScore * 4.5)
    : null;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Hero */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          {roadmapProgress > 0 ? `Bienvenido de vuelta, ${userName} 👋` : `Bienvenido, ${userName} 👋`}
        </h1>
        <p style={{ color: "var(--text-secondary)" }} className="text-sm">
          {roadmapProgress === 0
            ? "Empezá evaluando tu nicho — es el primer paso que define todo."
            : `${completedItems.length} de ${allItems.length} tareas completadas. Seguí así.`}
        </p>
      </div>

      {/* Progress bar global */}
      <div
        className="rounded-xl p-5 border"
        style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
      >
        <ProgressBar
          value={roadmapProgress}
          label="Progreso del Roadmap"
          color="var(--accent-primary)"
          height={10}
        />
        <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
          {roadmapProgress === 0
            ? "Completá la evaluación de nicho para comenzar"
            : roadmapProgress === 100
            ? "🎉 ¡Roadmap completo! Hora de escalar."
            : `Fase ${Math.floor(roadmapProgress / 25)} en curso`}
        </p>
      </div>

      {/* 4 Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <MetricsCard
          title="Puntuación Nicho"
          value={nicheScore ? Math.round(nicheScore) : null}
          unit="/96"
          subtitle={nicheScore ? (nicheScore >= 70 ? "✅ Nicho aprobado" : nicheScore >= 50 ? "⚡ Refinar" : "❌ Buscar otro") : "Sin evaluar"}
          trend={nicheScore ? "up" : "neutral"}
          accentColor="var(--accent-primary)"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          }
        />
        <MetricsCard
          title="Videos"
          value={videosPublished}
          subtitle={videosPublished === 0 ? "¡Publicá el primero!" : `${videosPublished} publicados`}
          trend={videosPublished > 0 ? "up" : "neutral"}
          accentColor="var(--accent-secondary)"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          }
        />
        <MetricsCard
          title="Días para Monetizar"
          value={daysToMonetization}
          unit="días"
          subtitle="Objetivo: 90 días"
          trend={daysToMonetization ? "up" : "neutral"}
          accentColor="var(--accent-warning)"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          }
        />
        <MetricsCard
          title="Ingresos (90d)"
          value={projectedRevenue}
          unit="USD"
          subtitle="Proyección estimada"
          trend={projectedRevenue ? "up" : "neutral"}
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
            <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
              Próximas acciones
            </h2>
            {allItems.length > 0 && (
              <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "var(--bg-card)", color: "var(--text-muted)" }}>
                {completedItems.length}/{allItems.length} completas
              </span>
            )}
          </div>

          {pendingItems.length > 0 ? (
            <div className="space-y-2">
              {pendingItems.map((item) => (
                <ActionItem
                  key={item.id}
                  id={item.id}
                  description={item.description}
                  phase={item.phase as 0 | 1 | 2 | 3}
                />
              ))}
            </div>
          ) : (
            <div
              className="rounded-xl p-6 border text-center space-y-3"
              style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
            >
              <p className="text-2xl">🎯</p>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {allItems.length === 0
                  ? "El roadmap se crea cuando evaluás tu primer nicho"
                  : "¡Todas las tareas completadas! 🎉"}
              </p>
            </div>
          )}

          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href="/dashboard/roadmap">Ver roadmap completo →</Link>
          </Button>
        </div>

        {/* Sidebar derecho */}
        <div className="space-y-4">
          <DailyInsight />

          {/* CTA */}
          {!latestEval ? (
            <div
              className="rounded-xl p-5 border space-y-3"
              style={{
                background: "linear-gradient(135deg, var(--accent-primary)20, var(--accent-secondary)10)",
                borderColor: "var(--border-accent)",
              }}
            >
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--accent-primary)" }}>
                Tu próxima acción
              </p>
              <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                Evaluá tu nicho
              </h3>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                10 minutos. Resultado inmediato. Define el 80% de tu éxito.
              </p>
              <Button asChild size="sm" className="w-full">
                <Link href="/dashboard/evaluator">Evaluar nicho →</Link>
              </Button>
            </div>
          ) : (
            <div
              className="rounded-xl p-5 border space-y-3"
              style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-accent)" }}
            >
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--accent-primary)" }}>
                Último nicho evaluado
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  {channel?.niche ?? "Sin nombre"}
                </span>
                <span
                  className="text-lg font-black"
                  style={{
                    color: latestEval.totalScore >= 70
                      ? "var(--accent-success)"
                      : latestEval.totalScore >= 50
                      ? "var(--accent-warning)"
                      : "var(--accent-danger)",
                  }}
                >
                  {Math.round(latestEval.totalScore)}
                </span>
              </div>
              <Button asChild variant="secondary" size="sm" className="w-full">
                <Link href="/dashboard/evaluator">Evaluar otro nicho</Link>
              </Button>
            </div>
          )}

          {/* Donut de progreso */}
          {allItems.length > 0 && (
            <div
              className="rounded-xl p-4 border"
              style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
            >
              <p className="text-xs font-medium mb-3" style={{ color: "var(--text-muted)" }}>
                TAREAS DEL ROADMAP
              </p>
              <RoadmapDonut completed={completedItems.length} total={allItems.length} />
            </div>
          )}

          {/* Link al consultor */}
          <div
            className="rounded-xl p-4 border"
            style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
          >
            <p className="text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
              ¿Tenés dudas?
            </p>
            <Button asChild variant="secondary" size="sm" className="w-full">
              <Link href="/dashboard/consultant">Preguntale a FluxIA</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Acceso rápido a herramientas */}
      <div>
        <h2 className="font-semibold text-sm mb-3" style={{ color: "var(--text-primary)" }}>
          Acceso rápido
        </h2>
        <QuickAccessGrid />
      </div>
    </div>
  );
}
