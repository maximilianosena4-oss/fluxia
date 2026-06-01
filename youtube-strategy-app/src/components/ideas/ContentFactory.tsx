"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ContentIdeaResult } from "@/app/api/ai/ideas/route";
import { useEvaluatorStore } from "@/store/useEvaluatorStore";

type FilterStatus = "all" | "saved" | "used";

interface IdeaWithMeta extends ContentIdeaResult {
  savedId?: string;    // DB id si fue guardada
  dbStatus?: string;   // estado en DB
}

export function ContentFactory() {
  const { nicheName } = useEvaluatorStore();
  const [niche, setNiche] = useState(nicheName || "");
  const [ideas, setIdeas] = useState<IdeaWithMeta[]>([]);
  const [savedIdeas, setSavedIdeas] = useState<Array<{ id: string; title: string; status: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSaved, setIsLoadingSaved] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadSavedIdeas = useCallback(async () => {
    try {
      const res = await fetch("/api/content-ideas");
      if (res.ok) {
        const data = await res.json() as { ideas: Array<{ id: string; title: string; status: string }> };
        setSavedIdeas(data.ideas);
      }
    } finally {
      setIsLoadingSaved(false);
    }
  }, []);

  useEffect(() => { void loadSavedIdeas(); }, [loadSavedIdeas]);

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
      setIdeas(data.ideas.map((idea) => ({ ...idea })));
      toast.success(`${data.ideas.length} ideas generadas para "${niche}"`);
    } catch {
      setError("Error de conexión.");
    } finally {
      setIsLoading(false);
    }
  }

  async function saveIdea(idea: IdeaWithMeta) {
    if (idea.savedId) {
      toast.info("Esta idea ya está guardada");
      return;
    }
    try {
      const res = await fetch("/api/content-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: idea.title,
          hook: idea.hook,
          description: `Ángulo: ${idea.differentiator}\nHerramienta: ${idea.productionTool}`,
          outlierScore: idea.viralityScore,
          status: "pending",
        }),
      });
      if (res.ok) {
        const data = await res.json() as { idea: { id: string } };
        setIdeas((prev) => prev.map((i) => i.id === idea.id ? { ...i, savedId: data.idea.id } : i));
        setSavedIdeas((prev) => [...prev, { id: data.idea.id, title: idea.title, status: "pending" }]);
        toast.success("¡Idea guardada en tu biblioteca!");
      }
    } catch {
      toast.error("Error al guardar");
    }
  }

  async function updateStatus(savedId: string, status: string) {
    try {
      await fetch("/api/content-ideas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: savedId, status }),
      });
      setSavedIdeas((prev) => prev.map((i) => i.id === savedId ? { ...i, status } : i));
      setIdeas((prev) => prev.map((i) => i.savedId === savedId ? { ...i, dbStatus: status } : i));
      toast.success(status === "published" ? "¡Marcada como publicada! 🚀" : "Estado actualizado");
    } catch {
      toast.error("Error al actualizar");
    }
  }

  const filtered = filter === "saved"
    ? savedIdeas.map((s) => ({
        id: s.id,
        title: s.title,
        hook: "",
        differentiator: "",
        viralityScore: 0,
        outlierInspiration: "",
        estimatedRpm: 0,
        productionTool: "",
        thumbnailPrompt: "",
        savedId: s.id,
        dbStatus: s.status,
      })) as IdeaWithMeta[]
    : ideas;

  return (
    <div className="space-y-6">
      {/* Input + generar */}
      <div className="rounded-xl p-5 border space-y-4" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}>
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
              style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent-primary)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
            />
            <Button onClick={() => void generateIdeas()} loading={isLoading} disabled={!niche.trim()}>
              {isLoading ? "Generando..." : "Generar ideas"}
            </Button>
          </div>
        </div>
        {error && <p className="text-sm" style={{ color: "var(--accent-danger)" }}>{error}</p>}
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(["all", "saved"] as FilterStatus[]).map((f) => (
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
              {f === "all" ? `Generadas (${ideas.length})` : `Biblioteca (${savedIdeas.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Ideas */}
      <div className="space-y-4">
        {filtered.map((idea) => (
          <IdeaCard
            key={idea.id}
            idea={idea}
            expanded={expandedId === idea.id}
            onToggleExpand={() => setExpandedId(expandedId === idea.id ? null : idea.id)}
            onSave={() => void saveIdea(idea)}
            onMarkPublished={() => idea.savedId && void updateStatus(idea.savedId, "published")}
          />
        ))}
      </div>

      {ideas.length === 0 && filter === "all" && !isLoading && (
        <div className="text-center py-16 space-y-3">
          <div className="text-5xl">💡</div>
          <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
            Generá ideas para tu nicho
          </h3>
          <p className="text-sm max-w-sm mx-auto" style={{ color: "var(--text-secondary)" }}>
            Aplicamos el Outlier Test de MrBeast: analizamos videos virales reales para ideas con alto potencial.
          </p>
        </div>
      )}

      {savedIdeas.length === 0 && filter === "saved" && !isLoadingSaved && (
        <div className="text-center py-12" style={{ color: "var(--text-muted)" }}>
          <p className="text-sm">No hay ideas guardadas todavía. Generá ideas y guardá las que más te gusten.</p>
        </div>
      )}
    </div>
  );
}

interface IdeaCardProps {
  idea: IdeaWithMeta;
  expanded: boolean;
  onToggleExpand: () => void;
  onSave: () => void;
  onMarkPublished: () => void;
}

function IdeaCard({ idea, expanded, onToggleExpand, onSave, onMarkPublished }: IdeaCardProps) {
  const [copied, setCopied] = useState(false);

  function copyThumbnailPrompt() {
    void navigator.clipboard.writeText(idea.thumbnailPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const scoreColor = idea.viralityScore >= 80 ? "var(--accent-success)"
    : idea.viralityScore >= 60 ? "var(--accent-warning)"
    : "var(--accent-secondary)";

  const isPublished = idea.dbStatus === "published";
  const isSaved = !!idea.savedId;

  return (
    <Card style={{ borderColor: isSaved ? "var(--border-accent)" : "var(--border-default)" }}>
      <div className="flex items-start gap-4 cursor-pointer" onClick={onToggleExpand}>
        {idea.viralityScore > 0 && (
          <div
            className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black"
            style={{ backgroundColor: `${scoreColor}20`, color: scoreColor }}
          >
            {idea.viralityScore}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm leading-snug" style={{ color: "var(--text-primary)" }}>
            {idea.title}
          </h3>
          <div className="flex items-center gap-2 mt-1.5 text-xs flex-wrap" style={{ color: "var(--text-muted)" }}>
            {idea.estimatedRpm > 0 && <span>RPM ~${idea.estimatedRpm}</span>}
            {idea.productionTool && <><span>•</span><span>{idea.productionTool}</span></>}
            {isSaved && <span style={{ color: "var(--accent-primary)" }}>• ⭐ Guardada</span>}
            {isPublished && <span style={{ color: "var(--accent-success)" }}>• ✓ Publicada</span>}
          </div>
        </div>

        <svg
          className="w-4 h-4 flex-shrink-0 transition-transform duration-200"
          style={{ color: "var(--text-muted)", transform: expanded ? "rotate(180deg)" : "rotate(0)" }}
          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
        </svg>
      </div>

      {expanded && (
        <div className="mt-5 space-y-4 border-t pt-4" style={{ borderColor: "var(--border-default)" }}>
          <div className="grid sm:grid-cols-2 gap-4">
            {idea.hook && <InfoBlock label="Gancho (primeros 30s)" value={idea.hook} />}
            {idea.differentiator && <InfoBlock label="Ángulo diferenciador" value={idea.differentiator} />}
            {idea.outlierInspiration && <InfoBlock label="Inspirado en" value={idea.outlierInspiration} />}
            {idea.thumbnailPrompt && (
              <InfoBlock
                label="Prompt para thumbnail"
                value={idea.thumbnailPrompt}
                action={
                  <button onClick={copyThumbnailPrompt} className="text-xs ml-2" style={{ color: "var(--accent-primary)" }}>
                    {copied ? "¡Copiado!" : "Copiar"}
                  </button>
                }
              />
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {!isSaved && (
              <Button variant="secondary" size="sm" onClick={onSave}>
                ⭐ Guardar idea
              </Button>
            )}
            {isSaved && !isPublished && (
              <Button variant="secondary" size="sm" onClick={onMarkPublished}>
                🚀 Marcar como publicada
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

function InfoBlock({ label, value, action }: { label: string; value: string; action?: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center">
        <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{label}</p>
        {action}
      </div>
      <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{value}</p>
    </div>
  );
}
