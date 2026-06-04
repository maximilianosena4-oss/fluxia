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
