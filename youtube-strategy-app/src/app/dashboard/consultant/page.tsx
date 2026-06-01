import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { ChatInterface } from "@/components/consultant/ChatInterface";

export const metadata: Metadata = { title: "Consultor IA" };

export default async function ConsultantPage() {
  const session = await auth();
  const userId = session?.user?.id ?? "";

  const channel = await prisma.channel.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      nicheEvaluations: { orderBy: { createdAt: "desc" }, take: 1 },
      actionItems: { where: { completedAt: { not: null } }, orderBy: { completedAt: "desc" }, take: 3 },
    },
  });

  const nicheScore = channel?.nicheEvaluations[0]?.totalScore ?? null;
  const lastActions = channel?.actionItems.map((a) => a.description) ?? [];
  const allItems = await prisma.actionItem.count({ where: { channelId: channel?.id ?? "" } });
  const doneItems = await prisma.actionItem.count({
    where: { channelId: channel?.id ?? "", completedAt: { not: null } },
  });
  const roadmapProgress = allItems > 0 ? Math.round((doneItems / allItems) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Consultor IA — NEXUS
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Respuestas concretas en segundos · Basado en los 5 mentores
          {nicheScore && (
            <span style={{ color: "var(--accent-primary)" }}>
              {" "}· Nicho: {Math.round(nicheScore)}/96
            </span>
          )}
        </p>
      </div>
      <ChatInterface
        initialContext={{
          nicheScore,
          roadmapProgress,
          currentNiche: channel?.niche ?? null,
          lastCompletedActions: lastActions,
        }}
      />
    </div>
  );
}
