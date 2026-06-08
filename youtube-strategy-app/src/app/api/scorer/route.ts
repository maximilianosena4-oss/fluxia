// POST /api/scorer — Quality Scorer (score 1-100 con breakdown)

import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { scoreVideoIdea, type VideoScore } from "@/lib/ai/anthropic";
import { sanitizeForLLM } from "@/lib/security/sanitize";
import { checkRateLimit, rateLimitHeaders } from "@/lib/security/rateLimit";
import { cacheGet, cacheSet } from "@/lib/db/redis";

const RequestSchema = z.object({
  title: z.string().min(2).max(200),
  thumbnailConcept: z.string().min(2).max(500),
  scriptSummary: z.string().min(2).max(1000),
  niche: z.string().min(2).max(100),
});

export interface ScorerResponse {
  score: VideoScore;
  cached: boolean;
}

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

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { title, thumbnailConcept, scriptSummary, niche } = parsed.data;

  const { safe: titleSafe } = sanitizeForLLM(title);
  const { safe: nicheSafe } = sanitizeForLLM(niche);
  if (!titleSafe || !nicheSafe) {
    return NextResponse.json({ error: "Input inválido" }, { status: 400 });
  }

  const cacheKey = `scorer:${Buffer.from(title + niche).toString("base64").slice(0, 32)}`;
  const cached = await cacheGet<ScorerResponse>(cacheKey);
  if (cached) {
    return NextResponse.json({ ...cached, cached: true });
  }

  const score = await scoreVideoIdea(title, thumbnailConcept, scriptSummary, `Nicho: ${niche}`);

  if (!score) {
    return NextResponse.json({ error: "No se pudo calcular el score" }, { status: 500 });
  }

  const result: ScorerResponse = { score, cached: false };
  await cacheSet(cacheKey, result, 3600);

  return NextResponse.json(result);
}
