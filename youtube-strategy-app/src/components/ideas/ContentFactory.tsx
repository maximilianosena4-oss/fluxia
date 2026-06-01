"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ContentIdeaResult } from "@/app/api/ai/ideas/route";
import { useEvaluatorStore } from "@/store/useEvaluatorStore";

type FilterStatus = "all" | "saved" | "used";

interface IdeaWithStatus extends ContentIdeaResult {
  saved: boolean;
  used: boolean;
}

export function ContentFactory() {
  const { nicheName } = useEvaluatorStore();
  const [niche, setNiche] = useState(nicheName || "");
  const [ideas, setIdeas] = useState<IdeaWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function generateIdeas() {
    if (!niche.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: niche.trim(), count: 5 }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setError(data.error ?? "Error al generar ideas");
        return;
      }

      const data = await res.json() as { ideas: ContentIdeaResult[] };
      setIdeas(data.ideas.map((idea) => ({ ...idea, saved: false, used: false })));
    } catch {
      setError("Error de conexión. Verificá tu internet.");
    } finally {
      setIsLoading(false);
    }
  }

  function toggleSaved(id: string) {
    setIdeas((prev) =>
      prev.map((idea) => (idea.id === id ? { ...idea, saved: !idea.saved } : idea))
    );
  }

  function markUsed(id: string) {
    setIdeas((prev) =>
      prev.map((idea) => (idea.id === id ? { ...idea, used: true } : idea))
    );
  }

  const filtered = ideas.filter((idea) => {
    if (filter === "saved") return idea.saved;
    if (filter === "used") return idea.used;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Input + generar */}
      <div
        className="rounded-xl p-5 border space-y-4"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border-default)",
        }}
      >
        <div>
          <label className="text-sm font-medium block mb-2" style={{ color: "var(--text-secondary)" }}>
            Nicho para generar ideas
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void generateIdeas()}
              placeholder="ej: Finanzas personales para millennials"
              className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none border"
              style={{
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border-default)",
                color: "var(--text-primary)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent-primary)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
            />
            <Button
              onClick={() => void generateIdeas()}
              loading={isLoading}
              disabled={!niche.trim()}
            >
              {isLoading ? "Generando..." : "Generar 5 ideas"}
            </Button>
          </div>
        </div>

        {error && (
          <p className="text-sm" style={{ color: "var(--accent-danger)" }}>{error}</p>
        )}
      </div>

      {/* Filtros */}
      {ideas.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {(["all", "saved", "used"] as FilterStatus[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-3 py-1 rounded-lg text-xs font-medium border transition-all"
                style={{
                  backgroundColor: filter === f ? "var(--accent-primary)" : "var(--bg-secondary)",
                  borderColor: filter === f ? "var(--accent-primary)" : "var(--border-default)",
                  color: filter === f ? "white" : "var(--text-secondary)",
                }}
              >
                {{ all: "Todas", saved: "Guardadas", used: "Usadas" }[f]}
              </button>
            ))}
          </div>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {filtered.length} idea{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* Ideas grid */}
      <div className="space-y-4">
        {filtered.map((idea) => (
          <IdeaCard
            key={idea.id}
            idea={idea}
            expanded={expandedId === idea.id}
            onToggleExpand={() => setExpandedId(expandedId === idea.id ? null : idea.id)}
            onSave={() => toggleSaved(idea.id)}
            onMarkUsed={() => markUsed(idea.id)}
          />
        ))}
      </div>

      {ideas.length === 0 && !isLoading && (
        <div className="text-center py-16 space-y-3">
          <div className="text-5xl">💡</div>
          <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
            Generá ideas para tu nicho
          </h3>
          <p className="text-sm max-w-sm mx-auto" style={{ color: "var(--text-secondary)" }}>
            Aplicamos el Outlier Test de MrBeast: analizamos videos virales reales para generar ideas con alto potencial.
          </p>
        </div>
      )}
    </div>
  );
}

interface IdeaCardProps {
  idea: IdeaWithStatus;
  expanded: boolean;
  onToggleExpand: () => void;
  onSave: () => void;
  onMarkUsed: () => void;
}

function IdeaCard({ idea, expanded, onToggleExpand, onSave, onMarkUsed }: IdeaCardProps) {
  const [copied, setCopied] = useState(false);

  function copyThumbnailPrompt() {
    void navigator.clipboard.writeText(idea.thumbnailPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const scoreColor =
    idea.viralityScore >= 80
      ? "var(--accent-success)"
      : idea.viralityScore >= 60
      ? "var(--accent-warning)"
      : "var(--accent-secondary)";

  return (
    <Card
      style={{
        opacity: idea.used ? 0.6 : 1,
        borderColor: idea.saved ? "var(--border-accent)" : "var(--border-default)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-start gap-4 cursor-pointer"
        onClick={onToggleExpand}
      >
        {/* Virality score */}
        <div
          className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black"
          style={{
            backgroundColor: `${scoreColor}20`,
            color: scoreColor,
          }}
        >
          {idea.viralityScore}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm leading-snug" style={{ color: "var(--text-primary)" }}>
            {idea.title}
          </h3>
          <div className="flex items-center gap-3 mt-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
            <span>RPM ~${idea.estimatedRpm}</span>
            <span>•</span>
            <span>{idea.productionTool}</span>
            {idea.saved && (
              <>
                <span>•</span>
                <span style={{ color: "var(--accent-primary)" }}>⭐ Guardada</span>
              </>
            )}
            {idea.used && (
              <>
                <span>•</span>
                <span style={{ color: "var(--accent-success)" }}>✓ Usada</span>
              </>
            )}
          </div>
        </div>

        <svg
          className="w-4 h-4 flex-shrink-0 transition-transform duration-200"
          style={{
            color: "var(--text-muted)",
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
          }}
          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
        </svg>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="mt-5 space-y-4 border-t pt-4" style={{ borderColor: "var(--border-default)" }}>
          <div className="grid sm:grid-cols-2 gap-4">
            <InfoBlock label="Gancho (primeros 30s)" value={idea.hook} />
            <InfoBlock label="Ángulo diferenciador" value={idea.differentiator} />
            <InfoBlock label="Inspirado en" value={idea.outlierInspiration} />
            <InfoBlock
              label="Prompt para thumbnail"
              value={idea.thumbnailPrompt}
              action={
                <button
                  onClick={copyThumbnailPrompt}
                  className="text-xs ml-2"
                  style={{ color: "var(--accent-primary)" }}
                >
                  {copied ? "¡Copiado!" : "Copiar"}
                </button>
              }
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              variant="secondary"
              size="sm"
              onClick={onSave}
            >
              {idea.saved ? "⭐ Guardada" : "Guardar"}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onMarkUsed}
              disabled={idea.used}
            >
              {idea.used ? "✓ Usada" : "Marcar como usada"}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function InfoBlock({
  label,
  value,
  action,
}: {
  label: string;
  value: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center">
        <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
          {label}
        </p>
        {action}
      </div>
      <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        {value}
      </p>
    </div>
  );
}
