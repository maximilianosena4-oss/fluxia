import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";

export const metadata: Metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const session = await auth();
  const userId = session?.user?.id ?? "";

  const channel = await prisma.channel.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      nicheEvaluations: { orderBy: { createdAt: "desc" }, take: 5 },
      actionItems: true,
      contentIdeas: true,
    },
  });

  const evaluations = (channel?.nicheEvaluations ?? []).map((e) => ({
    id: e.id,
    totalScore: e.totalScore,
    recommendation: e.recommendation,
    createdAt: e.createdAt.toISOString(),
    criteriaJson: e.criteriaJson as Record<string, unknown>,
  }));

  const items = (channel?.actionItems ?? []).map((i) => ({
    phase: i.phase,
    completed: i.completedAt !== null,
  }));

  const ideas = (channel?.contentIdeas ?? []).map((i) => ({
    status: i.status,
    outlierScore: i.outlierScore,
  }));

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 space-y-1">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Analytics
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Visualizá tu progreso y métricas clave del canal.
        </p>
      </div>
      <AnalyticsDashboard
        evaluations={evaluations}
        actionItems={items}
        contentIdeas={ideas}
        niche={channel?.niche ?? null}
      />
    </div>
  );
}
