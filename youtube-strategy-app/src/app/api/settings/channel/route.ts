// PATCH /api/settings/channel — actualizar youtubeChannelId del canal

import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";

const Schema = z.object({
  youtubeChannelId: z.string().min(1).max(100),
});

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const channel = await prisma.channel.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  if (!channel) return NextResponse.json({ error: "Canal no encontrado" }, { status: 404 });

  const updated = await prisma.channel.update({
    where: { id: channel.id },
    data: { youtubeChannelId: parsed.data.youtubeChannelId },
  });

  return NextResponse.json({ channel: updated });
}
