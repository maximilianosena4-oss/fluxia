// Outlier Test — Principio de MrBeast
// Busca videos con 10x el promedio del canal. Si existen, el nicho funciona.

import { getChannelStats } from "@/lib/youtube/client";
import { cacheGet, cacheSet } from "@/lib/db/redis";
import type { OutlierTestResult, YouTubeVideo } from "@/types/youtube";

const OUTLIER_MULTIPLIER = 10;
const CACHE_TTL = 6 * 60 * 60; // 6 horas

export async function runOutlierTest(
  channelId: string,
  videos: YouTubeVideo[]
): Promise<OutlierTestResult> {
  const cacheKey = `yt:outlier:${channelId}`;
  const cached = await cacheGet<OutlierTestResult>(cacheKey);
  if (cached) return cached;

  const channel = await getChannelStats(channelId);
  const channelTitle = channel?.title ?? channelId;

  if (videos.length === 0) {
    return {
      channelId,
      channelTitle,
      averageViews: 0,
      topVideoViews: 0,
      outlierRatio: 0,
      hasOutlier: false,
      outlierVideos: [],
    };
  }

  const totalViews = videos.reduce((sum, v) => sum + v.viewCount, 0);
  const averageViews = Math.round(totalViews / videos.length);
  const threshold = averageViews * OUTLIER_MULTIPLIER;

  const outlierVideos = videos
    .filter((v) => v.viewCount >= threshold)
    .sort((a, b) => b.viewCount - a.viewCount);

  const topVideoViews = Math.max(...videos.map((v) => v.viewCount), 0);
  const outlierRatio = averageViews > 0 ? topVideoViews / averageViews : 0;

  const result: OutlierTestResult = {
    channelId,
    channelTitle,
    averageViews,
    topVideoViews,
    outlierRatio: Math.round(outlierRatio * 10) / 10,
    hasOutlier: outlierVideos.length > 0,
    outlierVideos,
  };

  await cacheSet(cacheKey, result, CACHE_TTL);
  return result;
}

export function outlierTestSummary(results: OutlierTestResult[]): {
  nicheHasOutliers: boolean;
  channelsWithOutliers: number;
  maxOutlierRatio: number;
  recommendation: string;
} {
  const channelsWithOutliers = results.filter((r) => r.hasOutlier).length;
  const maxOutlierRatio = Math.max(...results.map((r) => r.outlierRatio), 0);
  const nicheHasOutliers = channelsWithOutliers > 0;

  let recommendation: string;
  if (nicheHasOutliers && maxOutlierRatio >= OUTLIER_MULTIPLIER) {
    recommendation = `✅ El nicho pasa el Outlier Test — hay videos con ${Math.round(maxOutlierRatio)}x el promedio del canal. Esto significa que el algoritmo amplifica este tipo de contenido.`;
  } else if (maxOutlierRatio >= 5) {
    recommendation = `⚠️ El nicho tiene potencial — ratio máximo de ${Math.round(maxOutlierRatio)}x. No llega al 10x ideal pero hay señales de amplificación algorítmica.`;
  } else {
    recommendation = `❌ El nicho no pasa el Outlier Test — el mayor video tiene solo ${Math.round(maxOutlierRatio)}x el promedio. El algoritmo no amplifica bien este contenido.`;
  }

  return { nicheHasOutliers, channelsWithOutliers, maxOutlierRatio, recommendation };
}
