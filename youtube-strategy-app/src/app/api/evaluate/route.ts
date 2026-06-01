// POST /api/evaluate — Análisis de nicho con YouTube API + IA
// Devuelve los inputs de scoring calculados automáticamente

import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { searchVideos, searchChannels } from "@/lib/youtube/client";
import { webSearch } from "@/lib/search/tavily";
import { sanitizeForLLM } from "@/lib/security/sanitize";
import { checkRateLimit } from "@/lib/security/rateLimit";
import type { ScoringInputs } from "@/lib/scoring/nicheScore";

const RequestSchema = z.object({
  niche: z.string().min(2).max(100),
  subNiche: z.string().max(100).optional(),
  language: z.enum(["ES", "EN", "PT", "FR", "OTHER"]).default("ES"),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const rl = await checkRateLimit(session.user.id, "youtube");
  if (!rl.success) {
    return NextResponse.json(
      { error: "Demasiadas consultas. Esperá un minuto." },
      { status: 429 }
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

  const { niche } = parsed.data;
  const { safe, sanitized } = sanitizeForLLM(niche);
  if (!safe) {
    return NextResponse.json({ error: "Input inválido" }, { status: 400 });
  }

  try {
    // Búsqueda paralela de videos y canales
    const [videos, channels, webResults] = await Promise.allSettled([
      searchVideos(niche, 15, parsed.data.language === "ES" ? "es" : "en"),
      searchChannels(niche, 8),
      webSearch(`canal youtube "${niche}" monetización`, 3),
    ]);

    const videoList = videos.status === "fulfilled" ? videos.value : [];
    const channelList = channels.status === "fulfilled" ? channels.value : [];

    // Calcular inputs de scoring automáticamente
    const totalViews = videoList.reduce((s, v) => s + v.viewCount, 0);
    const avgViews = videoList.length > 0 ? totalViews / videoList.length : 0;
    const maxViews = Math.max(...videoList.map((v) => v.viewCount), 0);
    const hasOutlier = avgViews > 0 && maxViews >= avgViews * 10;
    const recentVideos = videoList.filter(
      (v) => new Date(v.publishedAt) > new Date(Date.now() - 90 * 86400000)
    );

    const channelSubs = channelList.map((c) => c.subscriberCount);
    const smallChannels = channelSubs.filter((s) => s < 100_000).length;
    const dominantsUnder100k = channelList.length === 0 || smallChannels / channelList.length > 0.6;

    const inputs: ScoringInputs = {
      hasActiveSearches: videoList.length >= 5,
      hasViralVideos: hasOutlier || maxViews > 100_000,
      hasSufficientVolume: videoList.length >= 10,
      hasGrowingTrend: recentVideos.length >= 3,
      hasSuccessCases: channelList.some((c) => c.subscriberCount > 10_000),
      hasPositiveProjection: webResults.status === "fulfilled" && webResults.value.results.length > 0,
      dominantChannelsUnder100k: dominantsUnder100k,
      noDominantPlayer: !channelList.some((c) => c.subscriberCount > 500_000),
      worksInOtherLanguages: true, // asumimos que sí — se valida en producción
      canApplyDifferentAngle: true,
      canPositionIn90Days: dominantsUnder100k,
      rpmScore: 4, // default medio — el usuario ajusta manualmente
      entryBarriersScore: dominantsUnder100k ? 6 : 3,
      scalabilityScore: 5,
      aiProductionScore: 6,
    };

    return NextResponse.json({
      inputs,
      topChannels: channelList.slice(0, 5).map((c) => ({
        id: c.id,
        title: c.title,
        subscriberCount: c.subscriberCount,
        thumbnailUrl: c.thumbnailUrl,
      })),
      sampleVideos: videoList.slice(0, 3).map((v) => ({
        id: v.id,
        title: v.title,
        viewCount: v.viewCount,
        thumbnailUrl: v.thumbnailUrl,
      })),
      stats: {
        totalVideosFound: videoList.length,
        avgViews: Math.round(avgViews),
        maxViews,
        hasOutlier,
        activeChannels: channelList.length,
      },
    });
  } catch (err) {
    console.error("[evaluate] Error:", err);
    return NextResponse.json(
      { error: "Error al analizar el nicho. Intentá de nuevo." },
      { status: 500 }
    );
  }
}
