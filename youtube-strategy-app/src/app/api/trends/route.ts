// POST /api/trends — Trend Detection Engine (YouTube trending + IA)

import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getTrendingVideos, searchVideos } from "@/lib/youtube/client";
import { detectTrends, type TrendAnalysis } from "@/lib/ai/anthropic";
import { sanitizeForLLM } from "@/lib/security/sanitize";
import { checkRateLimit, rateLimitHeaders } from "@/lib/security/rateLimit";
import { cacheGet, cacheSet } from "@/lib/db/redis";

const RequestSchema = z.object({
  niche: z.string().min(2).max(100),
  region: z.string().length(2).default("US"),
});

export interface TrendsResponse {
  analysis: TrendAnalysis;
  trendingVideos: Array<{
    id: string;
    title: string;
    channelTitle: string;
    viewCount: number;
    thumbnailUrl: string;
  }>;
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

  const { niche, region } = parsed.data;

  const { safe } = sanitizeForLLM(niche);
  if (!safe) {
    return NextResponse.json({ error: "Input inválido" }, { status: 400 });
  }

  const cacheKey = `trends:${region}:${niche}`;
  const cached = await cacheGet<TrendsResponse>(cacheKey);
  if (cached) {
    return NextResponse.json({ ...cached, cached: true });
  }

  // Fetch trending + niche videos in parallel
  const [trendingRaw, nicheVideos] = await Promise.allSettled([
    getTrendingVideos(region, 20),
    searchVideos(niche, 15),
  ]);

  const trending = trendingRaw.status === "fulfilled" ? trendingRaw.value : [];
  const niche_videos = nicheVideos.status === "fulfilled" ? nicheVideos.value : [];

  const trendingVideos = trending.slice(0, 10).map((v) => ({
    id: v.id,
    title: v.title,
    channelTitle: v.channelTitle,
    viewCount: v.viewCount,
    thumbnailUrl: v.thumbnailUrl,
  }));

  const nicheContext = niche_videos
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 8)
    .map((v) => `"${v.title}" — ${v.viewCount.toLocaleString()} vistas — ${v.channelTitle}`)
    .join("\n");

  const trendingContext = trending
    .slice(0, 10)
    .map((v) => `"${v.title}" — ${v.viewCount.toLocaleString()} vistas`)
    .join("\n");

  const analysis = await detectTrends(
    `Nicho: ${niche}\nRegión: ${region}\n\nTop videos del nicho:\n${nicheContext}`,
    `Videos trending globales en ${region}:\n${trendingContext}`
  );

  const result: TrendsResponse = {
    analysis: analysis ?? {
      trendingNow: [],
      risingTopics: [],
      blueOceans: [],
      aiIdeas: [],
      summary: "No se pudo analizar tendencias en este momento.",
    },
    trendingVideos,
    cached: false,
  };

  // Cache for 2 hours
  await cacheSet(cacheKey, result, 7200);

  return NextResponse.json(result);
}
