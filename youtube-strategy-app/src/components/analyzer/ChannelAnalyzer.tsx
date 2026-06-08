"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { AnalyzeResponse, VideoAnalysis, ChannelAnalysis } from "@/app/api/analyze/route";

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function StatBadge({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex flex-col items-center p-3 rounded-xl"
      style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-default)" }}
    >
      <span className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{value}</span>
      <span className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{label}</span>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color = value >= 80 ? "#22c55e" : value >= 60 ? "#eab308" : "#ef4444";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span style={{ color: "var(--text-secondary)" }}>{label}</span>
        <span className="font-bold" style={{ color }}>{value}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-secondary)" }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function VideoResult({ data }: { data: VideoAnalysis }) {
  const { video, score } = data;
  const likeRatio = video.viewCount > 0 ? ((video.likeCount / video.viewCount) * 100).toFixed(2) : "0";

  return (
    <div className="space-y-4">
      <Card className="p-5 space-y-4" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-card)" }}>
        <div className="flex gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={video.thumbnailUrl} alt={video.title} className="w-40 h-24 object-cover rounded-lg flex-shrink-0" />
          <div className="min-w-0">
            <p className="font-semibold text-sm leading-snug" style={{ color: "var(--text-primary)" }}>{video.title}</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{video.channelTitle}</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{new Date(video.publishedAt).toLocaleDateString("es-AR")}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatBadge label="Vistas" value={formatNum(video.viewCount)} />
          <StatBadge label="Likes" value={formatNum(video.likeCount)} />
          <StatBadge label="Comentarios" value={formatNum(video.commentCount)} />
          <StatBadge label="Like ratio" value={`${likeRatio}%`} />
        </div>
        {video.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {video.tags.slice(0, 12).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded"
                style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-muted)" }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </Card>

      {score && (
        <Card className="p-5 space-y-4" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-card)" }}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Score de calidad (IA)</p>
            <span
              className="text-2xl font-black"
              style={{ color: score.total >= 80 ? "#22c55e" : score.total >= 60 ? "#eab308" : "#ef4444" }}
            >
              {score.total}
            </span>
          </div>
          <div className="space-y-3">
            <ScoreBar label="Título" value={score.breakdown.title} />
            <ScoreBar label="Thumbnail" value={score.breakdown.thumbnail} />
            <ScoreBar label="Contenido" value={score.breakdown.content} />
            <ScoreBar label="SEO" value={score.breakdown.seo} />
            <ScoreBar label="Fit del nicho" value={score.breakdown.nicheFit} />
          </div>
          {score.recommendations.length > 0 && (
            <div className="space-y-2 border-t pt-3" style={{ borderColor: "var(--border-default)" }}>
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Recomendaciones</p>
              <ul className="space-y-1.5">
                {score.recommendations.map((rec, i) => (
                  <li key={i} className="flex gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <span style={{ color: "var(--color-primary, #a855f7)", flexShrink: 0 }}>→</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function ChannelResult({ data }: { data: ChannelAnalysis }) {
  const { channel, recentVideos, avgViews, topVideo, outlierRatio } = data;

  return (
    <div className="space-y-4">
      <Card className="p-5 space-y-4" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-card)" }}>
        <div className="flex gap-4 items-start">
          {channel.thumbnailUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={channel.thumbnailUrl} alt={channel.title} className="w-14 h-14 rounded-full flex-shrink-0" />
          )}
          <div className="min-w-0">
            <p className="font-bold" style={{ color: "var(--text-primary)" }}>{channel.title}</p>
            {channel.country && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{channel.country}</p>}
            <p className="text-xs mt-1 line-clamp-2" style={{ color: "var(--text-secondary)" }}>{channel.description}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatBadge label="Suscriptores" value={formatNum(channel.subscriberCount)} />
          <StatBadge label="Videos" value={formatNum(channel.videoCount)} />
          <StatBadge label="Vistas totales" value={formatNum(channel.viewCount)} />
          <StatBadge label="Promedio vistas" value={formatNum(avgViews)} />
        </div>
        {outlierRatio > 0 && (
          <div
            className="p-3 rounded-lg"
            style={{
              backgroundColor: outlierRatio >= 10
                ? "color-mix(in srgb, #22c55e 10%, transparent)"
                : "var(--bg-secondary)",
              border: `1px solid ${outlierRatio >= 10 ? "color-mix(in srgb, #22c55e 25%, transparent)" : "var(--border-default)"}`,
            }}
          >
            <p className="text-xs font-bold" style={{ color: outlierRatio >= 10 ? "#22c55e" : "var(--text-muted)" }}>
              Outlier ratio: {outlierRatio}x {outlierRatio >= 10 ? "— ¡Canal outlier detectado!" : ""}
            </p>
            {topVideo && (
              <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                Video pico: "{topVideo.title}" — {formatNum(topVideo.viewCount)} vistas
              </p>
            )}
          </div>
        )}
      </Card>

      {recentVideos.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            Videos recientes (por vistas)
          </p>
          <div className="space-y-2">
            {recentVideos.map((v) => (
              <div
                key={v.id}
                className="flex gap-3 p-3 rounded-xl"
                style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-default)" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={v.thumbnailUrl} alt={v.title} className="w-20 h-12 object-cover rounded flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium line-clamp-2" style={{ color: "var(--text-primary)" }}>{v.title}</p>
                  <div className="flex gap-3 mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                    <span>{formatNum(v.viewCount)} vistas</span>
                    <span>{formatNum(v.likeCount)} likes</span>
                    <span>{new Date(v.publishedAt).toLocaleDateString("es-AR")}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ChannelAnalyzer() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function analyze() {
    if (!url.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json() as AnalyzeResponse & { error?: string };
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Error al analizar");
        return;
      }

      setResult(data);
      toast.success(`${data.type === "video" ? "Video" : "Canal"} analizado${data.cached ? " (caché)" : ""}`);
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-5 space-y-4" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-card)" }}>
        <div className="space-y-1.5">
          <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            URL de YouTube
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") void analyze(); }}
            placeholder="https://youtube.com/watch?v=... o /@canal o /channel/..."
            className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
            style={{
              backgroundColor: "var(--bg-secondary)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-default)",
            }}
          />
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Soporta: youtube.com/watch?v=, /@handle, /channel/, /shorts/, youtu.be/
          </p>
        </div>
        <Button onClick={() => void analyze()} disabled={!url.trim() || isLoading} className="w-full">
          {isLoading ? "Analizando..." : "Analizar"}
        </Button>
      </Card>

      {error && (
        <div
          className="p-4 rounded-xl text-sm"
          style={{
            backgroundColor: "color-mix(in srgb, #ef4444 10%, transparent)",
            color: "#ef4444",
            border: "1px solid color-mix(in srgb, #ef4444 20%, transparent)",
          }}
        >
          {error}
        </div>
      )}

      {isLoading && (
        <div className="space-y-4 animate-pulse">
          <div className="h-40 rounded-xl" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-default)" }} />
          <div className="h-48 rounded-xl" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-default)" }} />
        </div>
      )}

      {!isLoading && result && (
        result.type === "video"
          ? <VideoResult data={result} />
          : <ChannelResult data={result} />
      )}
    </div>
  );
}
