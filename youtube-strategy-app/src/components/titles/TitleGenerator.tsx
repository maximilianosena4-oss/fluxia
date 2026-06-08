"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { TitlesResponse } from "@/app/api/titles/route";
import type { GeneratedTitle } from "@/lib/ai/anthropic";

const STYLES = [
  { value: "educational", label: "Educativo" },
  { value: "entertainment", label: "Entretenimiento" },
  { value: "tutorial", label: "Tutorial" },
  { value: "storytime", label: "Story Time" },
  { value: "listicle", label: "Lista / Top" },
  { value: "challenge", label: "Challenge" },
] as const;

type Style = (typeof STYLES)[number]["value"];

function ctrColor(score: number): string {
  if (score >= 80) return "var(--color-success, #22c55e)";
  if (score >= 60) return "var(--color-warning, #eab308)";
  return "var(--color-danger, #ef4444)";
}

function CtrBadge({ score }: { score: number }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
      style={{
        backgroundColor: `color-mix(in srgb, ${ctrColor(score)} 15%, transparent)`,
        color: ctrColor(score),
        border: `1px solid color-mix(in srgb, ${ctrColor(score)} 30%, transparent)`,
      }}
    >
      CTR {score}
    </span>
  );
}

function TitleCard({ item, index }: { item: GeneratedTitle; index: number }) {
  const [expanded, setExpanded] = useState(false);

  function copyTitle() {
    void navigator.clipboard.writeText(item.title);
    toast.success("Título copiado");
  }

  return (
    <Card
      className="p-4 cursor-pointer transition-all hover:shadow-md"
      style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-card)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span
            className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)" }}
          >
            {index + 1}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm leading-snug break-words" style={{ color: "var(--text-primary)" }}>
              {item.title}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <CtrBadge score={item.ctrScore} />
              {item.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded"
                  style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-muted)" }}
                >
                  #{tag}
                </span>
              ))}
              {item.tags.length > 3 && (
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  +{item.tags.length - 3}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={copyTitle}
            className="text-xs px-2 py-1 rounded transition-colors"
            style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)" }}
          >
            Copiar
          </button>
          <button
            onClick={() => setExpanded((e) => !e)}
            className="text-xs px-2 py-1 rounded transition-colors"
            style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)" }}
          >
            {expanded ? "Ocultar" : "Mejoras"}
          </button>
        </div>
      </div>

      {expanded && item.improvements.length > 0 && (
        <ul className="mt-3 space-y-1 border-t pt-3" style={{ borderColor: "var(--border-default)" }}>
          {item.improvements.map((imp, i) => (
            <li key={i} className="flex gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
              <span style={{ color: "var(--color-primary, #a855f7)" }}>→</span>
              {imp}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export function TitleGenerator() {
  const [topic, setTopic] = useState("");
  const [niche, setNiche] = useState("");
  const [style, setStyle] = useState<Style>("educational");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TitlesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    if (!topic.trim() || !niche.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/titles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), niche: niche.trim(), style, count: 10 }),
      });

      const data = await res.json() as TitlesResponse & { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Error al generar títulos");
        return;
      }

      setResult(data);
      toast.success(`${data.titles.length} títulos generados${data.cached ? " (caché)" : ""}`);
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Form */}
      <Card className="p-5 space-y-4" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-card)" }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Tema del video
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ej: cómo invertir en acciones siendo principiante"
              className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 transition-all"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border-default)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-default)",
              }}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Nicho
            </label>
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="Ej: finanzas personales"
              className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border-default)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-default)",
              }}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            Estilo del video
          </label>
          <div className="flex flex-wrap gap-2">
            {STYLES.map((s) => (
              <button
                key={s.value}
                onClick={() => setStyle(s.value)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  backgroundColor: style === s.value ? "var(--color-primary, #a855f7)" : "var(--bg-secondary)",
                  color: style === s.value ? "#fff" : "var(--text-secondary)",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={() => void generate()}
          disabled={!topic.trim() || !niche.trim() || isLoading}
          className="w-full"
        >
          {isLoading ? "Generando títulos..." : "Generar 10 títulos"}
        </Button>
      </Card>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl text-sm" style={{ backgroundColor: "color-mix(in srgb, #ef4444 10%, transparent)", color: "#ef4444", border: "1px solid color-mix(in srgb, #ef4444 20%, transparent)" }}>
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-3 animate-pulse">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-20 rounded-xl"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-default)" }}
            />
          ))}
        </div>
      )}

      {/* Results */}
      {!isLoading && result && (
        <div className="space-y-4">
          {result.referenceVideos.length > 0 && (
            <div
              className="p-4 rounded-xl space-y-2"
              style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-default)" }}
            >
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                Videos de referencia analizados
              </p>
              <div className="space-y-1">
                {result.referenceVideos.map((v, i) => (
                  <div key={i} className="flex justify-between text-xs gap-3">
                    <span className="truncate" style={{ color: "var(--text-secondary)" }}>{v.title}</span>
                    <span className="flex-shrink-0 font-medium" style={{ color: "var(--text-muted)" }}>
                      {v.viewCount.toLocaleString()} vistas
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              {result.titles.length} títulos generados
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Ordenados por score CTR
            </p>
          </div>

          <div className="space-y-3">
            {result.titles
              .sort((a, b) => b.ctrScore - a.ctrScore)
              .map((item, i) => (
                <TitleCard key={i} item={item} index={i} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
