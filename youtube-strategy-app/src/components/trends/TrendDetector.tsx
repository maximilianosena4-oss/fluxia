"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { TrendsResponse } from "@/app/api/trends/route";

const REGIONS = [
  { code: "US", label: "Estados Unidos" },
  { code: "ES", label: "España" },
  { code: "MX", label: "México" },
  { code: "AR", label: "Argentina" },
  { code: "BR", label: "Brasil" },
  { code: "GB", label: "Reino Unido" },
] as const;

type Region = (typeof REGIONS)[number]["code"];

function SectionCard({
  title,
  items,
  color,
}: {
  title: string;
  items: string[];
  color: string;
}) {
  return (
    <Card
      className="p-4 space-y-3"
      style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-card)" }}
    >
      <p className="text-xs font-bold uppercase tracking-wider" style={{ color }}>
        {title}
      </p>
      {items.length === 0 ? (
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Sin datos</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              <span style={{ color, flexShrink: 0 }}>▸</span>
              {item}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export function TrendDetector() {
  const [niche, setNiche] = useState("");
  const [region, setRegion] = useState<Region>("US");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TrendsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function detect() {
    if (!niche.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/trends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: niche.trim(), region }),
      });

      const data = await res.json() as TrendsResponse & { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Error al detectar tendencias");
        return;
      }

      setResult(data);
      toast.success(`Análisis completado${data.cached ? " (caché)" : ""}`);
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Form */}
      <Card
        className="p-5 space-y-4"
        style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-card)" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Nicho
            </label>
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="Ej: finanzas personales, fitness, tecnología"
              className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
              style={{
                backgroundColor: "var(--bg-secondary)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-default)",
              }}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Región
            </label>
            <div className="flex flex-wrap gap-2">
              {REGIONS.map((r) => (
                <button
                  key={r.code}
                  onClick={() => setRegion(r.code)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    backgroundColor: region === r.code ? "var(--color-primary, #a855f7)" : "var(--bg-secondary)",
                    color: region === r.code ? "#fff" : "var(--text-secondary)",
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Button
          onClick={() => void detect()}
          disabled={!niche.trim() || isLoading}
          className="w-full"
        >
          {isLoading ? "Analizando tendencias..." : "Detectar tendencias"}
        </Button>
      </Card>

      {/* Error */}
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

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 rounded-xl"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-default)" }}
            />
          ))}
        </div>
      )}

      {/* Results */}
      {!isLoading && result && (
        <div className="space-y-5">
          {/* Summary */}
          {result.analysis.summary && (
            <Card
              className="p-5"
              style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-secondary)" }}
            >
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
                Resumen del análisis
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>
                {result.analysis.summary}
              </p>
            </Card>
          )}

          {/* Analysis grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SectionCard
              title="Trending ahora"
              items={result.analysis.trendingNow}
              color="#ef4444"
            />
            <SectionCard
              title="Temas en ascenso"
              items={result.analysis.risingTopics}
              color="#eab308"
            />
            <SectionCard
              title="Blue Oceans"
              items={result.analysis.blueOceans}
              color="#22c55e"
            />
            <SectionCard
              title="Ideas de la IA"
              items={result.analysis.aiIdeas}
              color="var(--color-primary, #a855f7)"
            />
          </div>

          {/* Trending videos reference */}
          {result.trendingVideos.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                Videos trending en {region} usados como referencia
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.trendingVideos.map((v) => (
                  <div
                    key={v.id}
                    className="flex gap-3 p-3 rounded-xl"
                    style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-default)" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={v.thumbnailUrl}
                      alt={v.title}
                      className="w-16 h-10 object-cover rounded flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-medium line-clamp-2 leading-snug" style={{ color: "var(--text-primary)" }}>
                        {v.title}
                      </p>
                      <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                        {v.viewCount.toLocaleString()} vistas
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
