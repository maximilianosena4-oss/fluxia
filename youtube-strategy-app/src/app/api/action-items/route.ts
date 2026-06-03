// GET  /api/action-items — items del roadmap del usuario
// POST /api/action-items — crear items iniciales
// PATCH /api/action-items/[id] — toggle completado

import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";

const DEFAULT_ITEMS = [
  { phase: 0, step: 1, description: "Completar evaluación de nicho en NEXUS Evaluador" },
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
  { phase: 2, step: 5, description: "Revisar métricas semanales con NEXUS" },
  { phase: 3, step: 1, description: "Alcanzar 1.000 subs + 4.000h de visualización" },
  { phase: 3, step: 2, description: "Aplicar al Programa de Socios de YouTube" },
  { phase: 3, step: 3, description: "Activar primera fuente alternativa (afiliados o producto)" },
  { phase: 3, step: 4, description: "Expandir al segundo nicho o al inglés" },
];

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const channel = await prisma.channel.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  if (!channel) return NextResponse.json({ items: [] });

  let items = await prisma.actionItem.findMany({
    where: { channelId: channel.id },
    orderBy: [{ phase: "asc" }, { step: "asc" }],
  });

  // Seed inicial si no hay items
  if (items.length === 0) {
    await prisma.actionItem.createMany({
      data: DEFAULT_ITEMS.map((item) => ({
        channelId: channel.id,
        ...item,
      })),
    });
    items = await prisma.actionItem.findMany({
      where: { channelId: channel.id },
      orderBy: [{ phase: "asc" }, { step: "asc" }],
    });
  }

  return NextResponse.json({ items });
}

const CreateSchema = z.object({
  description: z.string().min(3).max(200),
  phase: z.number().int().min(0).max(3).default(2),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const channel = await prisma.channel.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  if (!channel) return NextResponse.json({ error: "Canal no encontrado" }, { status: 404 });

  // Paso = número más alto existente en esa fase + 1
  const maxStep = await prisma.actionItem.aggregate({
    where: { channelId: channel.id, phase: parsed.data.phase },
    _max: { step: true },
  });

  const item = await prisma.actionItem.create({
    data: {
      channelId:   channel.id,
      description: parsed.data.description,
      phase:       parsed.data.phase,
      step:        (maxStep._max.step ?? 0) + 1,
    },
  });

  return NextResponse.json({ item }, { status: 201 });
}

const ToggleSchema = z.object({
  id: z.string(),
  completed: z.boolean(),
});

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = ToggleSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const { id, completed } = parsed.data;

  // Verificar que el item pertenece al usuario
  const item = await prisma.actionItem.findFirst({
    where: { id, channel: { userId: session.user.id } },
  });

  if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const updated = await prisma.actionItem.update({
    where: { id },
    data: { completedAt: completed ? new Date() : null },
  });

  return NextResponse.json({ item: updated });
}
