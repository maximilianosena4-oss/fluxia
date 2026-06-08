// POST /api/analyze — Channel/Video Analyzer (YouTube URL → metrics + AI)

import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getVideoDetails,
  getChannelStats,
  getChannelVideos,
  resolveHandle,
} from "@/lib/youtube/client";
import { scoreVideoIdea } from "@/lib/ai/anthropic";
import { checkRateLimit, rateLimitHeaders } from "@/lib/security/rateLimit";
import { cacheGet, cacheSet } from "@/lib/db/redis";
import type { YouTubeVideo, YouTubeChannel } from "@/types/youtube";
import type { VideoScore } from "@/lib/ai/anthropic";

const RequestSchema = z.object({
  url: z.string().url().max(500),
});

export type AnalyzeType = "video" | "channel";

export interface VideoAnalysis {
  type: "video";
  video: YouTubeVideo;
  score: VideoScore | null;
}

export interface ChannelAnalysis {
  type: "channel";
  channel: YouTubeChannel;
  recentVideos: YouTubeVideo[];
  avgViews: number;
  topVideo: YouTubeVideo | null;
  outlierRatio: number;
}

export type AnalyzeResponse = (VideoAnalysis | ChannelAnalysis) & { cached: boolean };

function parseYouTubeUrl(raw: string): { type: AnalyzeType; id: string } | null {
  try {
    const url = new URL(raw);
    const hostname = url.hostname.replace(/^www\./, "");

    // youtu.be/<videoId>
    if (hostname === "youtu.be") {
      const id = url.pathname.slice(1).split("?")[0];
      if (id) return { type: "video", id };
    }

    if (hostname !== "youtube.com") return null;

    // /watch?v=<videoId>
    const v = url.searchParams.get("v");
    if (v) return { type: "video", id: v };

    // /shorts/<videoId>
    const shortsMatch = url.pathname.match(/^\/shorts\/([^/?]+)/);
    if (shortsMatch) return { type: "video", id: shortsMatch[1] };

    // /channel/<channelId>
    const channelMatch = url.pathname.match(/^\/channel\/([^/?]+)/);
    if (channelMatch) return { type: "channel", id: channelMatch[1] };

    // /@handle or /c/<handle> or /user/<handle>
    const handleMatch = url.pathname.match(/^\/@([^/?]+)/) ??
      url.pathname.match(/^\/c\/([^/?]+)/) ??
      url.pathname.match(/^\/user\/([^/?]+)/);
    if (handleMatch) return { type: "channel", id: `@${handleMatch[1]}` };

    return null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const rl = await checkRateLimit(session.user.id, "youtube");
  if (!rl.success) {
    return NextResponse.json(
      { error: "Demasiadas consultas" },
      { status: 429, headers: rateLimitHeaders(rl, "youtube") }
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
    return NextResponse.json({ error: "URL inválida" }, { status: 400 });
  }

  const { url } = parsed.data;
  const parsed_url = parseYouTubeUrl(url);
  if (!parsed_url) {
    return NextResponse.json({ error: "URL de YouTube no reconocida. Probá con youtube.com/watch?v=..., /@canal o youtu.be/..." }, { status: 400 });
  }

  const cacheKey = `analyze:${parsed_url.type}:${parsed_url.id}`;
  const cached = await cacheGet<AnalyzeResponse>(cacheKey);
  if (cached) {
    return NextResponse.json({ ...cached, cached: true });
  }

  if (parsed_url.type === "video") {
    const video = await getVideoDetails(parsed_url.id);
    if (!video) {
      return NextResponse.json({ error: "Video no encontrado" }, { status: 404 });
    }

    const score = await scoreVideoIdea(
      video.title,
      `Thumbnail: ${video.thumbnailUrl}`,
      video.description.slice(0, 300),
      `Nicho: ${video.channelTitle}. Tags: ${video.tags.slice(0, 10).join(", ")}`
    );

    const result: AnalyzeResponse = { type: "video", video, score, cached: false };
    await cacheSet(cacheKey, result, 3600);
    return NextResponse.json(result);
  }

  // Channel
  let channelId = parsed_url.id;
  if (channelId.startsWith("@")) {
    const resolved = await resolveHandle(channelId);
    if (!resolved) {
      return NextResponse.json({ error: "Canal no encontrado" }, { status: 404 });
    }
    channelId = resolved;
  }

  const [channel, recentVideos] = await Promise.allSettled([
    getChannelStats(channelId),
    getChannelVideos(channelId, 20),
  ]);

  const ch = channel.status === "fulfilled" ? channel.value : null;
  if (!ch) {
    return NextResponse.json({ error: "Canal no encontrado" }, { status: 404 });
  }

  const videos = recentVideos.status === "fulfilled" ? recentVideos.value : [];
  const avgViews = videos.length
    ? Math.round(videos.reduce((s, v) => s + v.viewCount, 0) / videos.length)
    : 0;
  const sorted = [...videos].sort((a, b) => b.viewCount - a.viewCount);
  const topVideo = sorted[0] ?? null;
  const outlierRatio = avgViews > 0 && topVideo ? parseFloat((topVideo.viewCount / avgViews).toFixed(2)) : 0;

  const result: AnalyzeResponse = {
    type: "channel",
    channel: ch,
    recentVideos: sorted.slice(0, 10),
    avgViews,
    topVideo,
    outlierRatio,
    cached: false,
  };

  await cacheSet(cacheKey, result, 3600);
  return NextResponse.json(result);
}
