// GET  /api/content-ideas — biblioteca de ideas guardadas
// POST /api/content-ideas — guardar nueva idea

import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";

const SaveSchema = z.object({
  title: z.string().min(1).max(300),
  hook: z.string().optional(),
  description: z.string().optional(),
  outlierScore: z.number().min(0).max(100).optional(),
  status: z.enum(["pending", "in-progress", "published", "archived"]).default("pending"),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const channel = await prisma.channel.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  if (!channel) return NextResponse.json({ ideas: [] });

  const ideas = await prisma.contentIdea.findMany({
    where: { channelId: channel.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ ideas });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = SaveSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  let channel = await prisma.channel.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  if (!channel) {
    channel = await prisma.channel.create({
      data: { userId: session.user.id, status: "active" },
    });
  }

  const idea = await prisma.contentIdea.create({
    data: {
      channelId: channel.id,
      title: parsed.data.title,
      hook: parsed.data.hook,
      description: parsed.data.description,
      outlierScore: parsed.data.outlierScore,
      status: parsed.data.status,
    },
  });

  return NextResponse.json({ idea }, { status: 201 });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = z.object({
    id: z.string(),
    status: z.enum(["pending", "in-progress", "published", "archived"]),
  }).safeParse(body);

  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const idea = await prisma.contentIdea.findFirst({
    where: { id: parsed.data.id, channel: { userId: session.user.id } },
  });

  if (!idea) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const updated = await prisma.contentIdea.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status },
  });

  return NextResponse.json({ idea: updated });
}
