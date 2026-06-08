"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ScorerResponse } from "@/app/api/scorer/route";
import type { VideoScore } from "@/lib/ai/anthropic";

const DIMENSIONS: Array<{ key: keyof VideoScore["breakdown"]; label: string }> = [
  { key: "title", label: "Título" },
  { key: "thumbnail", label: "Thumbnail" },
  { key: "content", label: "Contenido" },
  { key: "seo", label: "SEO" },
  { key: "nicheFit", label: "Fit del nicho" },
];

function scoreColor(n: number): string {
  if (n >= 80) return "#22c55e";
  if (n >= 60) return "#eab308";
  return "#ef4444";
}

function ScoreGauge({ total }: { total: number }) {
  const color = scoreColor(total);
  const label = total >= 80 ? "Excelente" : total >= 60 ? "Bueno" : total >= 40 ? "Regular" : "Necesita mejoras";
  return (
    <div className="flex flex-col items-center gap-2 py-6">
      <div
        className="w-32 h-32 rounded-full flex flex-col items-center justify-center border-4"
        style={{ borderColor: color, backgroundColor: `color-mix(in srgb, ${color} 8%, transparent)` }}
      >
        <span className="text-4xl font-black" style={{ color }}>{total}</span>
        <span className="text-xs font-medium" style={{ color }}>/ 100</span>
      </div>
      <span className="text-sm font-semibold" style={{ color }}>{label}</span>
    </div>
  );
}

function ScoreBreakdown({ breakdown }: { breakdown: VideoScore["breakdown"] }) {
  return (
    <div className="space-y-3">
      {DIMENSIONS.map(({ key, label }) => {
        const val = breakdown[key];
        const color = scoreColor(val);
        return (
          <div key={key} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span style={{ color: "var(--text-secondary)" }}>{label}</span>
              <span className="font-bold" style={{ color }}>{val}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-secondary)" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${val}%`, backgroundColor: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function VideoScorer() {
  const [title, setTitle] = useState("");
  const [thumbnailConcept, setThumbnailConcept] = useState("");
  const [scriptSummary, setScriptSummary] = useState("");
  const [niche, setNiche] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ScorerResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = title.trim() && thumbnailConcept.trim() && scriptSummary.trim() && niche.trim();

  async function scoreIdea() {
    if (!canSubmit || isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/scorer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          thumbnailConcept: thumbnailConcept.trim(),
          scriptSummary: scriptSummary.trim(),
          niche: niche.trim(),
        }),
      });

      const data = await res.json() as ScorerResponse & { error?: string };
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Error al calcular score");
        return;
      }

      setResult(data);
      toast.success(`Score calculado: ${data.score.total}/100${data.cached ? " (caché)" : ""}`);
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-5 space-y-4" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-card)" }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Título del video
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: 5 errores que arruinan tu canal de YouTube"
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)", border: "1px solid var(--border-default)" }}
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
              placeholder="Ej: YouTube / creación de contenido"
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)", border: "1px solid var(--border-default)" }}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            Concepto de thumbnail
          </label>
          <textarea
            value={thumbnailConcept}
            onChange={(e) => setThumbnailConcept(e.target.value)}
            rows={2}
            placeholder="Ej: Fondo rojo, cara de sorpresa, texto 'ERRORES' en blanco, número 5 grande"
            className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
            style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)", border: "1px solid var(--border-default)" }}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            Resumen del guión
          </label>
          <textarea
            value={scriptSummary}
            onChange={(e) => setScriptSummary(e.target.value)}
            rows={3}
            placeholder="Describí brevemente el contenido, el hook, las secciones principales y el CTA"
            className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
            style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)", border: "1px solid var(--border-default)" }}
          />
        </div>

        <Button onClick={() => void scoreIdea()} disabled={!canSubmit || isLoading} className="w-full">
          {isLoading ? "Calculando score..." : "Calcular score (1-100)"}
        </Button>
      </Card>

      {error && (
        <div
          className="p-4 rounded-xl text-sm"
          style={{ backgroundColor: "color-mix(in srgb, #ef4444 10%, transparent)", color: "#ef4444", border: "1px solid color-mix(in srgb, #ef4444 20%, transparent)" }}
        >
          {error}
        </div>
      )}

      {isLoading && (
        <Card className="p-8 animate-pulse" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-card)" }}>
          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 rounded-full" style={{ backgroundColor: "var(--bg-secondary)" }} />
            <div className="w-full space-y-3">
              {[0, 1, 2, 3, 4].map((i) => <div key={i} className="h-4 rounded" style={{ backgroundColor: "var(--bg-secondary)" }} />)}
            </div>
          </div>
        </Card>
      )}

      {!isLoading && result && (
        <Card className="p-5" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-card)" }}>
          <ScoreGauge total={result.score.total} />

          <div className="border-t pt-4 space-y-4" style={{ borderColor: "var(--border-default)" }}>
            <ScoreBreakdown breakdown={result.score.breakdown} />

            {result.score.recommendations.length > 0 && (
              <div className="border-t pt-4 space-y-2" style={{ borderColor: "var(--border-default)" }}>
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                  Recomendaciones de la IA
                </p>
                <ul className="space-y-2">
                  {result.score.recommendations.map((rec, i) => (
                    <li key={i} className="flex gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                      <span style={{ color: "var(--color-primary, #a855f7)", flexShrink: 0 }}>→</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
