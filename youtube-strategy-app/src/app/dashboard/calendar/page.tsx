import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { ContentCalendar } from "@/components/calendar/ContentCalendar";

export const metadata: Metadata = { title: "Calendario de Contenido" };

export default async function CalendarPage() {
  const session = await auth();
  const userId = session?.user?.id ?? "";

  const channel = await prisma.channel.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const ideas = channel
    ? await prisma.contentIdea.findMany({
        where: { channelId: channel.id },
        orderBy: { createdAt: "asc" },
        take: 50,
      })
    : [];

  const serialized = ideas.map((idea) => ({
    id: idea.id,
    title: idea.title,
    status: idea.status,
    outlierScore: idea.outlierScore,
    createdAt: idea.createdAt.toISOString(),
    updatedAt: idea.updatedAt.toISOString(),
  }));

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 space-y-1">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Calendario de Contenido
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Planificá cuándo publicar cada idea. Consistencia &gt; talento (MrBeast).
        </p>
      </div>
      <ContentCalendar ideas={serialized} />
    </div>
  );
}
