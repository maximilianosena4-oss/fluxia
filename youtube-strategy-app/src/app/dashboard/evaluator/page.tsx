import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { NicheEvaluatorWizard } from "@/components/evaluator/NicheEvaluatorWizard";

export const metadata: Metadata = { title: "Evaluador de Nichos" };

export default async function EvaluatorPage() {
  const session = await auth();
  const userId = session?.user?.id ?? "";

  const channel = await prisma.channel.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      nicheEvaluations: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  const history = channel?.nicheEvaluations ?? [];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 space-y-1">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Evaluador de Nichos
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          10 minutos · Scoring automático con YouTube API · Resultado inmediato
        </p>
      </div>

      {/* Historial de evaluaciones previas */}
      {history.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--text-muted)" }}>
            EVALUACIONES ANTERIORES
          </h2>
          <div className="space-y-2">
            {history.map((ev) => {
              const score = Math.round(ev.totalScore);
              const color =
                score >= 70 ? "var(--accent-success)"
                : score >= 50 ? "var(--accent-warning)"
                : "var(--accent-danger)";
              const label = score >= 70 ? "GO" : score >= 50 ? "REFINE" : "DISCARD";
              const niche = (ev.criteriaJson as Record<string, unknown>)?.nicheName as string
                ?? channel?.niche
                ?? "Sin nombre";
              return (
                <div
                  key={ev.id}
                  className="flex items-center justify-between px-4 py-3 rounded-lg border"
                  style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      {niche}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {new Date(ev.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: `${color}20`, color }}>
                      {label}
                    </span>
                    <span className="text-lg font-black tabular-nums" style={{ color }}>
                      {score}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 border-t pt-4" style={{ borderColor: "var(--border-default)" }}>
            <p className="text-xs font-semibold mb-3" style={{ color: "var(--text-muted)" }}>
              NUEVA EVALUACIÓN
            </p>
          </div>
        </div>
      )}

      <NicheEvaluatorWizard />
    </div>
  );
}
