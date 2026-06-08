// POST /api/titles — Generador de títulos con IA + YouTube reference

import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { searchVideos } from "@/lib/youtube/client";
import { generateTitles, type GeneratedTitle } from "@/lib/ai/anthropic";
import { sanitizeForLLM } from "@/lib/security/sanitize";
import { checkRateLimit, rateLimitHeaders } from "@/lib/security/rateLimit";
import { cacheGet, cacheSet } from "@/lib/db/redis";

const RequestSchema = z.object({
  topic: z.string().min(2).max(200),
  niche: z.string().min(2).max(100),
  style: z.enum(["educational", "entertainment", "tutorial", "storytime", "listicle", "challenge"]),
  count: z.number().int().min(1).max(10).default(10),
});

export interface TitlesResponse {
  titles: GeneratedTitle[];
  referenceVideos: Array<{ title: string; viewCount: number; channelTitle: string }>;
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
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 });
  }

  const { topic, niche, style, count } = parsed.data;

  const { safe: topicSafe } = sanitizeForLLM(topic);
  const { safe: nicheSafe } = sanitizeForLLM(niche);
  if (!topicSafe || !nicheSafe) {
    return NextResponse.json({ error: "Input inválido" }, { status: 400 });
  }

  const cacheKey = `titles:${niche}:${topic}:${style}:${count}`;
  const cached = await cacheGet<TitlesResponse>(cacheKey);
  if (cached) {
    return NextResponse.json({ ...cached, cached: true });
  }

  // Fetch reference videos from YouTube for context
  let referenceVideos: Array<{ title: string; viewCount: number; channelTitle: string }> = [];
  try {
    const videos = await searchVideos(`${topic} ${niche}`, 10);
    referenceVideos = videos
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 5)
      .map((v) => ({ title: v.title, viewCount: v.viewCount, channelTitle: v.channelTitle }));
  } catch {
    // non-fatal — continue without reference videos
  }

  const titlesWithContext = await generateTitles(
    topic,
    niche,
    `${style}. Reference titles with high views: ${referenceVideos.map((v) => `"${v.title}" (${v.viewCount.toLocaleString()} views)`).join(", ")}`,
    count
  );

  const result: TitlesResponse = {
    titles: titlesWithContext,
    referenceVideos,
    cached: false,
  };

  // Cache for 1 hour
  await cacheSet(cacheKey, result, 3600);

  return NextResponse.json(result);
}
