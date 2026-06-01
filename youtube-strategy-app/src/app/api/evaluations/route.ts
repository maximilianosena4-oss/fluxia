// GET  /api/evaluations — últimas evaluaciones del usuario
// POST /api/evaluations — guardar nueva evaluación

import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import { checkRateLimit } from "@/lib/security/rateLimit";

const CreateSchema = z.object({
  nicheName: z.string().min(1).max(100),
  criteriaJson: z.record(z.string(), z.unknown()),
  totalScore: z.number().min(0).max(96),
  recommendation: z.string(),
});

export async function GET(_request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const channel = await prisma.channel.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  if (!channel) return NextResponse.json({ evaluations: [] });

  const evaluations = await prisma.nicheEvaluation.findMany({
    where: { channelId: channel.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return NextResponse.json({ evaluations });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const rl = await checkRateLimit(session.user.id, "global");
  if (!rl.success) return NextResponse.json({ error: "Rate limit" }, { status: 429 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const { nicheName, criteriaJson, totalScore, recommendation } = parsed.data;

  // Obtener o crear canal del usuario
  let channel = await prisma.channel.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  if (!channel) {
    channel = await prisma.channel.create({
      data: { userId: session.user.id, niche: nicheName, status: "active" },
    });
  } else {
    // Actualizar nicho y score del canal
    channel = await prisma.channel.update({
      where: { id: channel.id },
      data: { niche: nicheName, score: totalScore },
    });
  }

  const evaluation = await prisma.nicheEvaluation.create({
    data: {
      channelId: channel.id,
      criteriaJson: criteriaJson as Prisma.InputJsonValue,
      totalScore,
      recommendation,
    },
  });

  return NextResponse.json({ evaluation, channelId: channel.id }, { status: 201 });
}
