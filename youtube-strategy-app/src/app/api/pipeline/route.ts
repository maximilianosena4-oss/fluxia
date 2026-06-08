// POST /api/pipeline — Guarda el pipeline completado en Supabase

import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { checkRateLimit, rateLimitHeaders } from "@/lib/security/rateLimit";

const SaveSchema = z.object({
  topic: z.string().min(2).max(200),
  niche: z.string().min(2).max(100),
  style: z.string().min(2).max(50),
  referenceVideos: z.unknown().optional(),
  outline: z.unknown().optional(),
  script: z.unknown().optional(),
  titles: z.unknown().optional(),
  thumbnail: z.unknown().optional(),
  seo: z.unknown().optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const rl = await checkRateLimit(session.user.id, "ai");
  if (!rl.success) {
    return NextResponse.json(
      { error: "Demasiadas consultas" },
      { status: 429, headers: rateLimitHeaders(rl, "ai") }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = SaveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { topic, niche, style, referenceVideos, outline, script, titles, thumbnail, seo } = parsed.data;

  try {
    const pipeline = await prisma.contentPipeline.create({
      data: {
        userId: session.user.id,
        topic,
        niche,
        style,
        referenceVideos: referenceVideos ?? undefined,
        outline: outline ?? undefined,
        script: script ?? undefined,
        titles: titles ?? undefined,
        thumbnail: thumbnail ?? undefined,
        seo: seo ?? undefined,
        status: "complete",
        completedAt: new Date(),
      },
    });

    return NextResponse.json({ id: pipeline.id, success: true });
  } catch (err) {
    console.error("[Pipeline] Save error:", err);
    return NextResponse.json({ error: "Error al guardar el pipeline" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "10"), 50);

  try {
    const pipelines = await prisma.contentPipeline.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        topic: true,
        niche: true,
        style: true,
        status: true,
        completedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ pipelines });
  } catch (err) {
    console.error("[Pipeline] Fetch error:", err);
    return NextResponse.json({ pipelines: [] });
  }
}
