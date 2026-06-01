// YouTube Data API v3 Client
// Usa API key real si YOUTUBE_API_KEY está disponible, sino devuelve mocks.

import { cacheGet, cacheSet } from "@/lib/db/redis";
import type {
  YouTubeChannel,
  YouTubeVideo,
  YouTubeSearchResult,
} from "@/types/youtube";

const BASE_URL = "https://www.googleapis.com/youtube/v3";
const CACHE_TTL_SECONDS = 6 * 60 * 60; // 6 horas (según brief)

function hasApiKey(): boolean {
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
    next: { revalidate: CACHE_TTL_SECONDS },
  });

  if (!res.ok) {
    throw new Error(`YouTube API error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function searchVideos(
  query: string,
  maxResults = 10,
  language = "es"
): Promise<YouTubeVideo[]> {
  const cacheKey = `yt:videos:${query}:${maxResults}:${language}`;
  const cached = await cacheGet<YouTubeVideo[]>(cacheKey);
  if (cached) return cached;

  if (!hasApiKey()) return getMockVideos(query);

  const data = await ytFetch<{ items: Array<Record<string, unknown>> }>("search", {
    part: "snippet",
    q: query,
    type: "video",
    relevanceLanguage: language,
    maxResults: maxResults.toString(),
    order: "viewCount",
  });

  const videos: YouTubeVideo[] = data.items.map((item: Record<string, unknown>) => {
    const snippet = item.snippet as Record<string, unknown>;
    const id = item.id as Record<string, unknown>;
    return {
      id: id.videoId as string,
      title: snippet.title as string,
      description: (snippet.description as string) ?? "",
      channelId: snippet.channelId as string,
      channelTitle: snippet.channelTitle as string,
      thumbnailUrl: (snippet.thumbnails as Record<string, Record<string, string>>).medium?.url ?? "",
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      duration: "",
      publishedAt: snippet.publishedAt as string,
      tags: [],
    };
  });

  await cacheSet(cacheKey, videos, CACHE_TTL_SECONDS);
  return videos;
}

export async function getChannelStats(
  channelId: string
): Promise<YouTubeChannel | null> {
  const cacheKey = `yt:channel:${channelId}`;
  const cached = await cacheGet<YouTubeChannel>(cacheKey);
  if (cached) return cached;

  if (!hasApiKey()) return getMockChannel(channelId);

  const data = await ytFetch<{ items: Array<Record<string, unknown>> }>("channels", {
    part: "snippet,statistics,brandingSettings",
    id: channelId,
  });

  if (!data.items?.length) return null;

  const item = data.items[0];
  const snippet = item.snippet as Record<string, unknown>;
  const stats = item.statistics as Record<string, string>;
  const branding = item.brandingSettings as Record<string, Record<string, string>>;

  const channel: YouTubeChannel = {
    id: item.id as string,
    title: snippet.title as string,
    description: (snippet.description as string) ?? "",
    subscriberCount: parseInt(stats.subscriberCount ?? "0"),
    videoCount: parseInt(stats.videoCount ?? "0"),
    viewCount: parseInt(stats.viewCount ?? "0"),
    thumbnailUrl: (snippet.thumbnails as Record<string, Record<string, string>>).medium?.url ?? "",
    country: snippet.country as string | null,
    keywords: branding?.channel?.keywords?.split(",") ?? [],
    publishedAt: snippet.publishedAt as string,
  };

  await cacheSet(cacheKey, channel, CACHE_TTL_SECONDS);
  return channel;
}

export async function searchChannels(
  query: string,
  maxResults = 5
): Promise<YouTubeChannel[]> {
  if (!hasApiKey()) return [getMockChannel("mock1"), getMockChannel("mock2")].filter(Boolean) as YouTubeChannel[];

  const data = await ytFetch<{ items: Array<Record<string, unknown>> }>("search", {
    part: "snippet",
    q: query,
    type: "channel",
    maxResults: maxResults.toString(),
  });

  const channelIds = data.items.map((item: Record<string, unknown>) => {
    const id = item.id as Record<string, unknown>;
    return id.channelId as string;
  });

  const channels = await Promise.all(channelIds.map(getChannelStats));
  return channels.filter(Boolean) as YouTubeChannel[];
}

// ─── Mocks para desarrollo sin API key ───────────────────────

function getMockVideos(query: string): YouTubeVideo[] {
  return Array.from({ length: 5 }, (_, i) => ({
    id: `mock-video-${i}`,
    title: `[MOCK] Video sobre "${query}" #${i + 1}`,
    description: "Mock video para desarrollo",
    channelId: `mock-channel-${i}`,
    channelTitle: `Canal Mock ${i + 1}`,
    thumbnailUrl: `https://picsum.photos/seed/${query}${i}/320/180`,
    viewCount: Math.floor(Math.random() * 500000) + 10000,
    likeCount: Math.floor(Math.random() * 10000),
    commentCount: Math.floor(Math.random() * 1000),
    duration: "PT8M30S",
    publishedAt: new Date(Date.now() - i * 86400000).toISOString(),
    tags: [query, "youtube", "mock"],
  }));
}

function getMockChannel(id: string): YouTubeChannel {
  return {
    id,
    title: `Canal Mock (${id})`,
    description: "Canal de prueba para desarrollo",
    subscriberCount: Math.floor(Math.random() * 100000) + 1000,
    videoCount: Math.floor(Math.random() * 200) + 10,
    viewCount: Math.floor(Math.random() * 5000000) + 100000,
    thumbnailUrl: `https://picsum.photos/seed/${id}/88/88`,
    country: "AR",
    keywords: ["youtube", "tutorial"],
    publishedAt: new Date(Date.now() - 365 * 86400000).toISOString(),
  };
}
