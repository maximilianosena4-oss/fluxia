import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { SettingsForm } from "./SettingsForm";

export const metadata: Metadata = { title: "Configuración" };

export default async function SettingsPage() {
  const session = await auth();
  const userId = session?.user?.id ?? "";

  const [user, channel, evaluationsCount, ideasCount] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.channel.findFirst({ where: { userId }, orderBy: { createdAt: "desc" } }),
    prisma.nicheEvaluation.count({ where: { channel: { userId } } }),
    prisma.contentIdea.count({ where: { channel: { userId } } }),
  ]);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Configuración
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Tu perfil y configuración del canal
        </p>
      </div>

      <SettingsForm
        user={{
          id: user?.id ?? "",
          name: user?.name ?? "",
          email: user?.email ?? "",
          image: user?.image ?? null,
          plan: user?.plan ?? "free",
          createdAt: user?.createdAt?.toISOString() ?? "",
        }}
        channel={{
          id: channel?.id ?? "",
          niche: channel?.niche ?? "",
          youtubeChannelId: channel?.youtubeChannelId ?? "",
          score: channel?.score ?? null,
        }}
        stats={{ evaluationsCount, ideasCount }}
      />
    </div>
  );
}
