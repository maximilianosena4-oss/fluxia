// POST /api/youtube/outlier
// Aplica el Outlier Test de MrBeast: busca videos con 10x el promedio del canal
// Funciona con API key real o en modo mock

import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { searchVideos } from "@/lib/youtube/client";
import { checkRateLimit } from "@/lib/security/rateLimit";
import { detectOutliers } from "@/lib/youtube/outlier";

const RequestSchema = z.object({
  niche:      z.string().min(2).max(100),
  language:   z.enum(["es", "en", "pt", "fr"]).default("es"),
  multiplier: z.number().min(2).max(20).default(10),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const rl = await checkRateLimit(session.user.id, "youtube");
  if (!rl.success) {
    return NextResponse.json({ error: "Demasiadas consultas. Esperá un minuto." }, { status: 429 });
  }

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400 }); }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { niche, language, multiplier } = parsed.data;

  try {
    const videos = await searchVideos(niche, 20, language);

    if (videos.length < 3) {
      return NextResponse.json({
        outliers: [],
        avgViews: 0,
        hasOutlier: false,
        message: "Insuficientes videos para aplicar el Outlier Test",
      });
    }

    const result = detectOutliers(videos, multiplier);

    return NextResponse.json({
      outliers:     result.outliers,
      avgViews:     result.avgViews,
      maxViews:     result.maxViews,
      hasOutlier:   result.outliers.length > 0,
      totalAnalyzed: videos.length,
      multiplierUsed: multiplier,
      verdict: result.outliers.length > 0
        ? `Nicho validado: ${result.outliers.length} outlier(s) con ${multiplier}x el promedio`
        : `Sin outliers claros con ${multiplier}x el promedio — nicho de riesgo`,
    });
  } catch {
    return NextResponse.json({ error: "Error al analizar outliers" }, { status: 500 });
  }
}
