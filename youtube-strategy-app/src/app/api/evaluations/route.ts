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

export async function GET() {
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

  // Si el nicho aprueba (>=50), seed del roadmap si no tiene items aún
  if (totalScore >= 50) {
    const existingItems = await prisma.actionItem.count({ where: { channelId: channel.id } });
    if (existingItems === 0) {
      const ROADMAP_SEED = [
        { phase: 0, step: 1, description: "Completar evaluación de nicho en FluxIA Evaluador" },
        { phase: 0, step: 2, description: "Validar en viralyt.ai (confirmar outliers reales)" },
        { phase: 0, step: 3, description: "Identificar 10 mejores canales de referencia" },
        { phase: 0, step: 4, description: "Aplicar Outlier Test a los 3 canales top" },
        { phase: 0, step: 5, description: "Diseñar la oferta backend ANTES de crear el canal (Hormozi)" },
        { phase: 1, step: 1, description: "Crear canal de YouTube con configuración completa" },
        { phase: 1, step: 2, description: "Diseñar banner y logo con identidad del nicho" },
        { phase: 1, step: 3, description: "Publicar Video 1 (guión viral)" },
        { phase: 1, step: 4, description: "Publicar Video 2 (A/B test de thumbnail)" },
        { phase: 1, step: 5, description: "Publicar Video 3 (medir CTR y retención)" },
        { phase: 2, step: 1, description: "Publicar 2-3 videos por semana consistentemente" },
        { phase: 2, step: 2, description: "Optimizar thumbnails con CTR < 3%" },
        { phase: 2, step: 3, description: "Replicar formato del video con mejor retención" },
        { phase: 2, step: 4, description: "Llegar a 500 suscriptores" },
        { phase: 2, step: 5, description: "Revisar métricas semanales con FluxIA" },
        { phase: 3, step: 1, description: "Alcanzar 1.000 subs + 4.000h de visualización" },
        { phase: 3, step: 2, description: "Aplicar al Programa de Socios de YouTube" },
        { phase: 3, step: 3, description: "Activar primera fuente alternativa (afiliados o producto)" },
        { phase: 3, step: 4, description: "Expandir al segundo nicho o al inglés" },
      ];
      await prisma.actionItem.createMany({
        data: ROADMAP_SEED.map((item) => ({ channelId: channel!.id, ...item })),
      });
      // Marcar paso 1 (evaluación) como completado automáticamente
      await prisma.actionItem.updateMany({
        where: { channelId: channel.id, phase: 0, step: 1 },
        data: { completedAt: new Date() },
      });
    }
  }

  return NextResponse.json({ evaluation, channelId: channel.id }, { status: 201 });
}
