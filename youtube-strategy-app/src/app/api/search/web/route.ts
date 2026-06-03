// POST /api/search/web — Búsqueda web con Tavily API
// Fallback automático a mock si TAVILY_API_KEY no está configurada
// Brief sección 8: "/api/search/web/route.ts"

import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { webSearch } from "@/lib/search/tavily";
import { checkRateLimit } from "@/lib/security/rateLimit";
import { sanitizeForLLM } from "@/lib/security/sanitize";

const RequestSchema = z.object({
  query:      z.string().min(2).max(200),
  maxResults: z.number().int().min(1).max(10).default(5),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const rl = await checkRateLimit(session.user.id, "ai");
  if (!rl.success) {
    return NextResponse.json({ error: "Demasiadas consultas. Esperá un minuto." }, { status: 429 });
  }

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400 }); }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
  }

  const { safe, sanitized } = sanitizeForLLM(parsed.data.query);
  if (!safe) {
    return NextResponse.json({ error: "Query inválida" }, { status: 400 });
  }

  try {
    const result = await webSearch(sanitized, parsed.data.maxResults);
    return NextResponse.json({
      ...result,
      isMock: !process.env.TAVILY_API_KEY,
    });
  } catch {
    return NextResponse.json({ error: "Error al buscar en la web" }, { status: 500 });
  }
}
