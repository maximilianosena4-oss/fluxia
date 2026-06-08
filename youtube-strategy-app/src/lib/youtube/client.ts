// YouTube Data API v3 Client
// Usa API key real si YOUTUBE_API_KEY está disponible, sino mock.
// Cache de 6 horas en Redis para minimizar consumo de quota.

import { cacheGet, cacheSet } from "@/lib/db/redis";
import { consumeQuota } from "@/lib/youtube/quota";
import type {
  YouTubeChannel,
  YouTubeVideo,
} from "@/types/youtube";

const BASE_URL = "https://www.googleapis.com/youtube/v3";
const CACHE_TTL = 6 * 60 * 60; // 6 horas

export function hasApiKey(): boolean {
  return !!process.env.YOUTUBE_API_KEY;
}

async function ytFetch<T>(
  endpoint: string,
  params: Record<string, string>
): Promise<T> {
  const url = new URL(`${BASE_URL}/${endpoint}`);
  url.searchParams.set("key", process.env.YOUTUBE_API_KEY!);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), {
    headers: { "Accept": "application/json" },
    next: { revalidate: CACHE_TTL },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(`YouTube API ${res.status}: ${err?.error?.message ?? res.statusText}`);
  }

  return res.json() as Promise<T>;
}

type YTSearchItem = {
  id: { videoId?: string; channelId?: string };
  snippet: {
    title: string;
    description: string;
    channelId: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails: { medium?: { url: string }; high?: { url: string } };
  };
};

type YTVideoItem = {
  id: string;
  snippet: { title: string; description: string; channelId: string; channelTitle: string; publishedAt: string; thumbnails: { medium?: { url: string } }; tags?: string[] };
  statistics: { viewCount?: string; likeCount?: string; commentCount?: string };
  contentDetails: { duration: string };
};

type YTVideoDetailItem = {
  id: string;
  snippet: { title: string; description: string; channelId: string; channelTitle: string; publishedAt: string; thumbnails: { medium?: { url: string }; high?: { url: string } }; tags?: string[] };
  statistics: { viewCount?: string; likeCount?: string; commentCount?: string };
  contentDetails: { duration: string };
  topicDetails?: { topicCategories?: string[] };
};

type YTChannelItem = {
  id: string;
  snippet: { title: string; description: string; publishedAt: string; thumbnails: { medium?: { url: string } }; country?: string };
  statistics: { subscriberCount?: string; videoCount?: string; viewCount?: string };
  brandingSettings?: { channel?: { keywords?: string } };
};

export async function searchVideos(
  query: string,
  maxResults = 10,
  language = "es"
): Promise<YouTubeVideo[]> {
  const cacheKey = `yt:videos:${query}:${maxResults}:${language}`;
  const cached = await cacheGet<YouTubeVideo[]>(cacheKey);
  if (cached) return cached;

  if (!hasApiKey()) return getMockVideos(query, maxResults);

  const quota = await consumeQuota("search");
  if (!quota.allowed) {
    console.warn("[YouTube] Quota agotada, usando mock");
    return getMockVideos(query, maxResults);
  }

  try {
    const data = await ytFetch<{ items: YTSearchItem[] }>("search", {
      part: "snippet",
      q: query,
      type: "video",
      relevanceLanguage: language,
      maxResults: maxResults.toString(),
      order: "viewCount",
      videoDuration: "medium",
    });

    // Obtener estadísticas en batch (1 sola llamada a videos.list)
    const videoIds = data.items.map((i) => i.id.videoId).filter(Boolean).join(",");
    let statsMap: Record<string, { viewCount: number; likeCount: number; commentCount: number; duration: string }> = {};

    if (videoIds) {
      await consumeQuota("videos");
      const statsData = await ytFetch<{ items: YTVideoItem[] }>("videos", {
        part: "statistics,contentDetails",
        id: videoIds,
      });
      statsMap = Object.fromEntries(
        statsData.items.map((v) => [
          v.id,
          {
            viewCount: parseInt(v.statistics.viewCount ?? "0"),
            likeCount: parseInt(v.statistics.likeCount ?? "0"),
            commentCount: parseInt(v.statistics.commentCount ?? "0"),
            duration: v.contentDetails.duration,
          },
        ])
      );
    }

    const videos: YouTubeVideo[] = data.items
      .filter((item) => item.id.videoId)
      .map((item) => {
        const stats = statsMap[item.id.videoId!] ?? { viewCount: 0, likeCount: 0, commentCount: 0, duration: "" };
        return {
          id: item.id.videoId!,
          title: item.snippet.title,
          description: item.snippet.description ?? "",
          channelId: item.snippet.channelId,
          channelTitle: item.snippet.channelTitle,
          thumbnailUrl: item.snippet.thumbnails.high?.url ?? item.snippet.thumbnails.medium?.url ?? "",
          viewCount: stats.viewCount,
          likeCount: stats.likeCount,
          commentCount: stats.commentCount,
          duration: stats.duration,
          publishedAt: item.snippet.publishedAt,
          tags: [],
        };
      });

    await cacheSet(cacheKey, videos, CACHE_TTL);
    return videos;
  } catch (err) {
    console.error("[YouTube] searchVideos error:", err);
    return getMockVideos(query, maxResults);
  }
}

export async function getChannelStats(channelId: string): Promise<YouTubeChannel | null> {
  const cacheKey = `yt:channel:${channelId}`;
  const cached = await cacheGet<YouTubeChannel>(cacheKey);
  if (cached) return cached;

  if (!hasApiKey()) return getMockChannel(channelId);

  const quota = await consumeQuota("channels");
  if (!quota.allowed) return getMockChannel(channelId);

  try {
    const data = await ytFetch<{ items: YTChannelItem[] }>("channels", {
      part: "snippet,statistics,brandingSettings",
      id: channelId,
    });

    if (!data.items?.length) return null;
    const item = data.items[0];

    const channel: YouTubeChannel = {
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description ?? "",
      subscriberCount: parseInt(item.statistics.subscriberCount ?? "0"),
      videoCount: parseInt(item.statistics.videoCount ?? "0"),
      viewCount: parseInt(item.statistics.viewCount ?? "0"),
      thumbnailUrl: item.snippet.thumbnails.medium?.url ?? "",
      country: item.snippet.country ?? null,
      keywords: item.brandingSettings?.channel?.keywords?.split(",") ?? [],
      publishedAt: item.snippet.publishedAt,
    };

    await cacheSet(cacheKey, channel, CACHE_TTL);
    return channel;
  } catch (err) {
    console.error("[YouTube] getChannelStats error:", err);
    return getMockChannel(channelId);
  }
}

export async function searchChannels(query: string, maxResults = 5): Promise<YouTubeChannel[]> {
  if (!hasApiKey()) return Array.from({ length: 3 }, (_, i) => getMockChannel(`mock-${i}`));

  const quota = await consumeQuota("search");
  if (!quota.allowed) return Array.from({ length: 3 }, (_, i) => getMockChannel(`mock-${i}`));

  try {
    const data = await ytFetch<{ items: YTSearchItem[] }>("search", {
      part: "snippet",
      q: query,
      type: "channel",
      maxResults: maxResults.toString(),
    });

    const channelIds = data.items
      .map((i) => i.id.channelId)
      .filter(Boolean) as string[];

    const channels = await Promise.allSettled(channelIds.map(getChannelStats));
    return channels
      .filter((r): r is PromiseFulfilledResult<YouTubeChannel> => r.status === "fulfilled" && r.value !== null)
      .map((r) => r.value);
  } catch {
    return Array.from({ length: 3 }, (_, i) => getMockChannel(`mock-${i}`));
  }
}

export async function resolveHandle(handle: string): Promise<string | null> {
  const clean = handle.startsWith("@") ? handle.slice(1) : handle;
  const cacheKey = `yt:handle:${clean}`;
  const cached = await cacheGet<string>(cacheKey);
  if (cached) return cached;

  if (!hasApiKey()) return `mock-channel-handle-${clean}`;

  const quota = await consumeQuota("channels");
  if (!quota.allowed) return null;

  try {
    const data = await ytFetch<{ items: YTChannelItem[] }>("channels", {
      part: "snippet",
      forHandle: clean,
    });

    if (!data.items?.length) return null;
    const channelId = data.items[0].id;
    await cacheSet(cacheKey, channelId, CACHE_TTL);
    return channelId;
  } catch (err) {
    console.error("[YouTube] resolveHandle error:", err);
    return null;
  }
}

export async function getChannelVideos(
  channelId: string,
  maxResults = 20
): Promise<YouTubeVideo[]> {
  const cacheKey = `yt:channel-videos:${channelId}:${maxResults}`;
  const cached = await cacheGet<YouTubeVideo[]>(cacheKey);
  if (cached) return cached;

  if (!hasApiKey()) return getMockChannelVideos(channelId, maxResults);

  const quota = await consumeQuota("search");
  if (!quota.allowed) {
    console.warn("[YouTube] Quota agotada, usando mock");
    return getMockChannelVideos(channelId, maxResults);
  }

  try {
    const data = await ytFetch<{ items: YTSearchItem[] }>("search", {
      part: "snippet",
      channelId,
      type: "video",
      order: "date",
      maxResults: maxResults.toString(),
    });

    const videoIds = data.items.map((i) => i.id.videoId).filter(Boolean).join(",");
    let statsMap: Record<string, { viewCount: number; likeCount: number; commentCount: number; duration: string; tags: string[] }> = {};

    if (videoIds) {
      await consumeQuota("videos");
      const statsData = await ytFetch<{ items: YTVideoDetailItem[] }>("videos", {
        part: "statistics,contentDetails,snippet",
        id: videoIds,
      });
      statsMap = Object.fromEntries(
        statsData.items.map((v) => [
          v.id,
          {
            viewCount: parseInt(v.statistics.viewCount ?? "0"),
            likeCount: parseInt(v.statistics.likeCount ?? "0"),
            commentCount: parseInt(v.statistics.commentCount ?? "0"),
            duration: v.contentDetails.duration,
            tags: v.snippet.tags ?? [],
          },
        ])
      );
    }

    const videos: YouTubeVideo[] = data.items
      .filter((item) => item.id.videoId)
      .map((item) => {
        const stats = statsMap[item.id.videoId!] ?? { viewCount: 0, likeCount: 0, commentCount: 0, duration: "", tags: [] };
        return {
          id: item.id.videoId!,
          title: item.snippet.title,
          description: item.snippet.description ?? "",
          channelId: item.snippet.channelId,
          channelTitle: item.snippet.channelTitle,
          thumbnailUrl: item.snippet.thumbnails.high?.url ?? item.snippet.thumbnails.medium?.url ?? "",
          viewCount: stats.viewCount,
          likeCount: stats.likeCount,
          commentCount: stats.commentCount,
          duration: stats.duration,
          publishedAt: item.snippet.publishedAt,
          tags: stats.tags,
        };
      });

    await cacheSet(cacheKey, videos, CACHE_TTL);
    return videos;
  } catch (err) {
    console.error("[YouTube] getChannelVideos error:", err);
    return getMockChannelVideos(channelId, maxResults);
  }
}

export async function getTrendingVideos(
  regionCode = "US",
  maxResults = 20
): Promise<YouTubeVideo[]> {
  const cacheKey = `yt:trending:${regionCode}:${maxResults}`;
  const cached = await cacheGet<YouTubeVideo[]>(cacheKey);
  if (cached) return cached;

  if (!hasApiKey()) return getMockTrendingVideos(regionCode, maxResults);

  const quota = await consumeQuota("videos");
  if (!quota.allowed) {
    console.warn("[YouTube] Quota agotada, usando mock");
    return getMockTrendingVideos(regionCode, maxResults);
  }

  try {
    const data = await ytFetch<{ items: YTVideoDetailItem[] }>("videos", {
      part: "snippet,statistics,contentDetails",
      chart: "mostPopular",
      regionCode,
      maxResults: maxResults.toString(),
    });

    const videos: YouTubeVideo[] = data.items.map((item) => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description ?? "",
      channelId: item.snippet.channelId,
      channelTitle: item.snippet.channelTitle,
      thumbnailUrl: item.snippet.thumbnails.high?.url ?? item.snippet.thumbnails.medium?.url ?? "",
      viewCount: parseInt(item.statistics.viewCount ?? "0"),
      likeCount: parseInt(item.statistics.likeCount ?? "0"),
      commentCount: parseInt(item.statistics.commentCount ?? "0"),
      duration: item.contentDetails.duration,
      publishedAt: item.snippet.publishedAt,
      tags: item.snippet.tags ?? [],
    }));

    await cacheSet(cacheKey, videos, CACHE_TTL);
    return videos;
  } catch (err) {
    console.error("[YouTube] getTrendingVideos error:", err);
    return getMockTrendingVideos(regionCode, maxResults);
  }
}

export async function getVideoDetails(videoId: string): Promise<YouTubeVideo | null> {
  const cacheKey = `yt:video-detail:${videoId}`;
  const cached = await cacheGet<YouTubeVideo>(cacheKey);
  if (cached) return cached;

  if (!hasApiKey()) return getMockVideoDetails(videoId);

  const quota = await consumeQuota("videos");
  if (!quota.allowed) return getMockVideoDetails(videoId);

  try {
    const data = await ytFetch<{ items: YTVideoDetailItem[] }>("videos", {
      part: "snippet,statistics,contentDetails,topicDetails",
      id: videoId,
    });

    if (!data.items?.length) return null;
    const item = data.items[0];

    const video: YouTubeVideo = {
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description ?? "",
      channelId: item.snippet.channelId,
      channelTitle: item.snippet.channelTitle,
      thumbnailUrl: item.snippet.thumbnails.high?.url ?? item.snippet.thumbnails.medium?.url ?? "",
      viewCount: parseInt(item.statistics.viewCount ?? "0"),
      likeCount: parseInt(item.statistics.likeCount ?? "0"),
      commentCount: parseInt(item.statistics.commentCount ?? "0"),
      duration: item.contentDetails.duration,
      publishedAt: item.snippet.publishedAt,
      tags: item.snippet.tags ?? [],
      topicCategories: item.topicDetails?.topicCategories ?? [],
    };

    await cacheSet(cacheKey, video, CACHE_TTL);
    return video;
  } catch (err) {
    console.error("[YouTube] getVideoDetails error:", err);
    return getMockVideoDetails(videoId);
  }
}

// ─── Mocks para desarrollo sin API key ───────────────────────

function getMockVideos(query: string, count = 5): YouTubeVideo[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `mock-video-${i}-${Date.now()}`,
    title: `[DEMO] ${i === 0 ? "Cómo ganar $1,000 con " : i === 1 ? "El secreto de " : `${i + 1} tips de `}"${query}"`,
    description: `Video de demostración sobre ${query}.`,
    channelId: `mock-channel-${i % 3}`,
    channelTitle: [`Canal Demo 1`, `Experto en ${query}`, `FluxIA Test`][i % 3],
    thumbnailUrl: `https://picsum.photos/seed/${encodeURIComponent(query)}${i}/320/180`,
    viewCount: [850000, 230000, 1200000, 45000, 380000][i % 5],
    likeCount: Math.floor([850000, 230000, 1200000, 45000, 380000][i % 5] * 0.04),
    commentCount: Math.floor([850000, 230000, 1200000, 45000, 380000][i % 5] * 0.005),
    duration: ["PT8M32S", "PT12M15S", "PT6M45S", "PT15M20S", "PT9M10S"][i % 5],
    publishedAt: new Date(Date.now() - i * 7 * 86400000).toISOString(),
    tags: [query, "youtube"],
  }));
}

function getMockChannel(id: string): YouTubeChannel {
  const idx = parseInt(id.replace(/\D/g, "") || "0") % 5;
  return {
    id,
    title: [`Canal Finanzas Pro`, `Tech Sin Límites`, `Salud Total`, `Historia Viral`, `Demo Canal`][idx],
    description: "Canal de demostración para desarrollo.",
    subscriberCount: [45000, 12000, 87000, 23000, 156000][idx],
    videoCount: [85, 34, 120, 45, 200][idx],
    viewCount: [3500000, 890000, 7200000, 1100000, 15000000][idx],
    thumbnailUrl: `https://picsum.photos/seed/channel${id}/88/88`,
    country: "AR",
    keywords: ["youtube", "contenido"],
    publishedAt: new Date(Date.now() - 365 * 86400000).toISOString(),
  };
}

function getMockChannelVideos(channelId: string, count = 20): YouTubeVideo[] {
  const topics = ["Inversión", "Productividad", "Tecnología", "Salud", "Negocios"];
  return Array.from({ length: count }, (_, i) => ({
    id: `mock-chvid-${channelId}-${i}`,
    title: `[DEMO] Video #${i + 1} del canal — ${topics[i % topics.length]}`,
    description: `Video de demostración del canal ${channelId}.`,
    channelId,
    channelTitle: `Canal Demo`,
    thumbnailUrl: `https://picsum.photos/seed/${channelId}${i}/320/180`,
    viewCount: Math.floor(Math.random() * 500000) + 5000,
    likeCount: Math.floor(Math.random() * 20000) + 200,
    commentCount: Math.floor(Math.random() * 2000) + 20,
    duration: ["PT7M12S", "PT11M30S", "PT5M55S", "PT14M08S", "PT9M40S"][i % 5],
    publishedAt: new Date(Date.now() - i * 5 * 86400000).toISOString(),
    tags: [topics[i % topics.length], "youtube", "contenido"],
  }));
}

function getMockTrendingVideos(regionCode: string, count = 20): YouTubeVideo[] {
  const titles = [
    "El VIDEO que TODOS están viendo ahora",
    "Por qué ESTO se volvió viral esta semana",
    "Nadie te contó ESTO sobre el trending",
    "La verdad sobre lo que está pasando",
    "Esto cambió TODO en un día",
  ];
  return Array.from({ length: count }, (_, i) => ({
    id: `mock-trend-${regionCode}-${i}`,
    title: `[DEMO] ${titles[i % titles.length]} #${i + 1}`,
    description: `Video trending en ${regionCode} — demostración.`,
    channelId: `mock-trend-channel-${i % 5}`,
    channelTitle: [`ViralNow`, `TrendMaster`, `TopContent`, `HotVideos`, `FluxDemo`][i % 5],
    thumbnailUrl: `https://picsum.photos/seed/trend${regionCode}${i}/320/180`,
    viewCount: Math.floor(Math.random() * 5000000) + 500000,
    likeCount: Math.floor(Math.random() * 200000) + 10000,
    commentCount: Math.floor(Math.random() * 50000) + 1000,
    duration: ["PT8M20S", "PT13M05S", "PT6M50S", "PT16M30S", "PT10M15S"][i % 5],
    publishedAt: new Date(Date.now() - i * 2 * 86400000).toISOString(),
    tags: ["trending", regionCode, "viral"],
  }));
}

function getMockVideoDetails(videoId: string): YouTubeVideo {
  return {
    id: videoId,
    title: `[DEMO] Video detallado — ${videoId}`,
    description: "Video de demostración con detalles completos para desarrollo.",
    channelId: "mock-detail-channel",
    channelTitle: "Canal Demo Detalle",
    thumbnailUrl: `https://picsum.photos/seed/${videoId}/320/180`,
    viewCount: 342000,
    likeCount: 14500,
    commentCount: 890,
    duration: "PT11M24S",
    publishedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    tags: ["finanzas", "inversión", "youtube", "monetización", "estrategia"],
    topicCategories: [
      "https://en.wikipedia.org/wiki/Finance",
      "https://en.wikipedia.org/wiki/Investment",
    ],
  };
}
