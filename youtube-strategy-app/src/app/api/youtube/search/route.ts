// GET /api/youtube/search?q=nicho&lang=es&maxResults=10
// Busca videos en YouTube Data API v3 con cache Redis 6h

import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { searchVideos } from "@/lib/youtube/client";
import { checkRateLimit } from "@/lib/security/rateLimit";

const QuerySchema = z.object({
  q:          z.string().min(2).max(100),
  lang:       z.enum(["es", "en", "pt", "fr"]).default("es"),
  maxResults: z.coerce.number().int().min(1).max(50).default(10),
});

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const rl = await checkRateLimit(session.user.id, "youtube");
  if (!rl.success) {
    return NextResponse.json({ error: "Demasiadas consultas. Esperá un minuto." }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = QuerySchema.safeParse({
    q:          searchParams.get("q"),
    lang:       searchParams.get("lang"),
    maxResults: searchParams.get("maxResults"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
  }

  const { q, lang, maxResults } = parsed.data;

  try {
    const videos = await searchVideos(q, maxResults, lang);
    return NextResponse.json({ videos, total: videos.length, query: q });
  } catch {
    return NextResponse.json({ error: "Error al buscar en YouTube" }, { status: 500 });
  }
}
