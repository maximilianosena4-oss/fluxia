"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { GeneratedTitle, GeneratedScript, GeneratedSEO, ThumbnailConcept } from "@/lib/ai/anthropic";

// ─── Types ────────────────────────────────────────────────────

type Style = "educational" | "entertainment" | "tutorial" | "storytime" | "listicle" | "challenge";

interface RefVideo {
  id: string;
  title: string;
  channelTitle: string;
  viewCount: number;
  thumbnailUrl: string;
  publishedAt: string;
}

interface Outline {
  hook: string;
  sections: Array<{ title: string; duration: string; keyPoints: string[] }>;
  cta: string;
  totalDuration: string;
}

interface PipelineData {
  topic: string;
  niche: string;
  style: Style;
  referenceVideos?: RefVideo[];
  outline?: Outline;
  script?: GeneratedScript;
  titles?: GeneratedTitle[];
  thumbnail?: ThumbnailConcept;
  seo?: GeneratedSEO;
}

const STEPS = [
  { id: 1, label: "Tema" },
  { id: 2, label: "Research" },
  { id: 3, label: "Outline" },
  { id: 4, label: "Guión" },
  { id: 5, label: "Títulos" },
  { id: 6, label: "Thumbnail" },
  { id: 7, label: "SEO" },
] as const;

const STYLES: Array<{ value: Style; label: string }> = [
  { value: "educational", label: "Educativo" },
  { value: "entertainment", label: "Entretenimiento" },
  { value: "tutorial", label: "Tutorial" },
  { value: "storytime", label: "Story Time" },
  { value: "listicle", label: "Lista / Top" },
  { value: "challenge", label: "Challenge" },
];

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

// ─── Step indicator ───────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      {STEPS.map((step, i) => {
        const done = current > step.id;
        const active = current === step.id;
        return (
          <div key={step.id} className="flex items-center gap-1 flex-shrink-0">
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                style={{
                  backgroundColor: done
                    ? "#22c55e"
                    : active
                    ? "var(--color-primary, #a855f7)"
                    : "var(--bg-secondary)",
                  color: done || active ? "#fff" : "var(--text-muted)",
                }}
              >
                {done ? "✓" : step.id}
              </div>
              <span
                className="text-xs whitespace-nowrap"
                style={{ color: active ? "var(--text-primary)" : "var(--text-muted)" }}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="w-6 h-0.5 mb-4 flex-shrink-0"
                style={{ backgroundColor: done ? "#22c55e" : "var(--border-default)" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 1 — Tema ────────────────────────────────────────────

function Step1Tema({
  data,
  onNext,
}: {
  data: PipelineData;
  onNext: (updates: Partial<PipelineData>) => void;
}) {
  const [topic, setTopic] = useState(data.topic);
  const [niche, setNiche] = useState(data.niche);
  const [style, setStyle] = useState<Style>(data.style);

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
        Define el tema y el contexto del video
      </p>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            Tema del video
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ej: cómo ahorrar $500 al mes siendo principiante"
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
            placeholder="Ej: finanzas personales"
            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)", border: "1px solid var(--border-default)" }}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            Estilo
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
      </div>
      <Button
        onClick={() => onNext({ topic, niche, style })}
        disabled={!topic.trim() || !niche.trim()}
        className="w-full"
      >
        Siguiente → Research
      </Button>
    </div>
  );
}

// ─── Step 2 — Research ────────────────────────────────────────

function Step2Research({
  data,
  stepData,
  isLoading,
  onNext,
}: {
  data: PipelineData;
  stepData: RefVideo[] | null;
  isLoading: boolean;
  onNext: () => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
        Videos de referencia — "{data.topic}"
      </p>
      {isLoading && (
        <div className="space-y-2 animate-pulse">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 rounded-xl" style={{ backgroundColor: "var(--bg-secondary)" }} />
          ))}
        </div>
      )}
      {!isLoading && stepData && (
        <div className="space-y-2">
          {stepData.map((v) => (
            <div
              key={v.id}
              className="flex gap-3 p-3 rounded-xl"
              style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-default)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={v.thumbnailUrl} alt={v.title} className="w-20 h-12 object-cover rounded flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium line-clamp-2" style={{ color: "var(--text-primary)" }}>{v.title}</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  {v.channelTitle} · {formatNum(v.viewCount)} vistas
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      <Button onClick={onNext} disabled={isLoading || !stepData} className="w-full">
        Siguiente → Outline
      </Button>
    </div>
  );
}

// ─── Step 3 — Outline ─────────────────────────────────────────

function Step3Outline({
  stepData,
  isLoading,
  onNext,
}: {
  stepData: Outline | null;
  isLoading: boolean;
  onNext: () => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Estructura del video</p>
      {isLoading && (
        <div className="space-y-3 animate-pulse">
          {[0, 1, 2].map((i) => <div key={i} className="h-20 rounded-xl" style={{ backgroundColor: "var(--bg-secondary)" }} />)}
        </div>
      )}
      {!isLoading && stepData && (
        <div className="space-y-3">
          <div className="p-3 rounded-xl" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-default)" }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>Hook</p>
            <p className="text-sm" style={{ color: "var(--text-primary)" }}>{stepData.hook}</p>
          </div>
          {stepData.sections.map((sec, i) => (
            <div key={i} className="p-3 rounded-xl" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-default)" }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{sec.title}</p>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{sec.duration}</span>
              </div>
              <ul className="space-y-1">
                {sec.keyPoints.map((kp, j) => (
                  <li key={j} className="text-xs flex gap-2" style={{ color: "var(--text-secondary)" }}>
                    <span style={{ color: "var(--color-primary, #a855f7)" }}>·</span>{kp}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="p-3 rounded-xl" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-default)" }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>CTA · {stepData.totalDuration}</p>
            <p className="text-sm" style={{ color: "var(--text-primary)" }}>{stepData.cta}</p>
          </div>
        </div>
      )}
      <Button onClick={onNext} disabled={isLoading || !stepData} className="w-full">Siguiente → Guión</Button>
    </div>
  );
}

// ─── Step 4 — Guión ───────────────────────────────────────────

function Step4Script({
  stepData,
  isLoading,
  onNext,
}: {
  stepData: GeneratedScript | null;
  isLoading: boolean;
  onNext: () => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Guión generado</p>
      {isLoading && <div className="h-48 rounded-xl animate-pulse" style={{ backgroundColor: "var(--bg-secondary)" }} />}
      {!isLoading && stepData && (
        <div className="space-y-3 text-sm" style={{ color: "var(--text-primary)" }}>
          {[
            { label: "Hook (30s)", text: stepData.hook },
            { label: "Intro", text: stepData.intro },
          ].map((s) => (
            <div key={s.label} className="p-3 rounded-xl" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-default)" }}>
              <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>{s.label}</p>
              <p className="leading-relaxed">{s.text}</p>
            </div>
          ))}
          {stepData.body.map((section, i) => (
            <div key={i} className="p-3 rounded-xl" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-default)" }}>
              <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>Sección {i + 1}</p>
              <p className="leading-relaxed">{section}</p>
            </div>
          ))}
          <div className="p-3 rounded-xl" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-default)" }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>CTA · {stepData.totalWords} palabras · {stepData.estimatedDuration}</p>
            <p className="leading-relaxed">{stepData.cta}</p>
          </div>
        </div>
      )}
      <Button onClick={onNext} disabled={isLoading || !stepData} className="w-full">Siguiente → Títulos</Button>
    </div>
  );
}

// ─── Step 5 — Títulos ─────────────────────────────────────────

function Step5Titles({
  stepData,
  isLoading,
  selectedTitle,
  onSelectTitle,
  onNext,
}: {
  stepData: GeneratedTitle[] | null;
  isLoading: boolean;
  selectedTitle: string;
  onSelectTitle: (t: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Seleccioná el mejor título</p>
      {isLoading && (
        <div className="space-y-2 animate-pulse">
          {[0, 1, 2, 3, 4].map((i) => <div key={i} className="h-14 rounded-xl" style={{ backgroundColor: "var(--bg-secondary)" }} />)}
        </div>
      )}
      {!isLoading && stepData && (
        <div className="space-y-2">
          {stepData.sort((a, b) => b.ctrScore - a.ctrScore).map((item, i) => (
            <button
              key={i}
              onClick={() => onSelectTitle(item.title)}
              className="w-full text-left p-3 rounded-xl transition-all"
              style={{
                backgroundColor: selectedTitle === item.title ? "color-mix(in srgb, var(--color-primary, #a855f7) 15%, transparent)" : "var(--bg-secondary)",
                border: `1px solid ${selectedTitle === item.title ? "var(--color-primary, #a855f7)" : "var(--border-default)"}`,
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.title}</p>
                <span className="text-xs font-bold flex-shrink-0" style={{ color: item.ctrScore >= 80 ? "#22c55e" : item.ctrScore >= 60 ? "#eab308" : "#ef4444" }}>
                  {item.ctrScore}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
      <Button onClick={onNext} disabled={isLoading || !stepData || !selectedTitle} className="w-full">
        Siguiente → Thumbnail
      </Button>
    </div>
  );
}

// ─── Step 6 — Thumbnail ───────────────────────────────────────

function Step6Thumbnail({
  stepData,
  isLoading,
  onNext,
}: {
  stepData: ThumbnailConcept | null;
  isLoading: boolean;
  onNext: () => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Concepto de thumbnail</p>
      {isLoading && <div className="h-48 rounded-xl animate-pulse" style={{ backgroundColor: "var(--bg-secondary)" }} />}
      {!isLoading && stepData && (
        <div className="space-y-3">
          {[
            { label: "Texto principal", value: stepData.mainText },
            { label: "Emoción", value: stepData.emotion },
            { label: "Paleta", value: stepData.colorScheme },
            { label: "Layout", value: stepData.layout },
            ...(stepData.ctaText ? [{ label: "Texto secundario", value: stepData.ctaText }] : []),
          ].map((row) => (
            <div key={row.label} className="p-3 rounded-xl" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-default)" }}>
              <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>{row.label}</p>
              <p className="text-sm" style={{ color: "var(--text-primary)" }}>{row.value}</p>
            </div>
          ))}
          <div className="p-3 rounded-xl" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-default)" }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "var(--text-muted)" }}>Elementos visuales</p>
            <ul className="space-y-1">
              {stepData.visualElements.map((el, i) => (
                <li key={i} className="flex gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <span style={{ color: "var(--color-primary, #a855f7)" }}>·</span>{el}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <Button onClick={onNext} disabled={isLoading || !stepData} className="w-full">Siguiente → SEO</Button>
    </div>
  );
}

// ─── Step 7 — SEO ─────────────────────────────────────────────

function Step7SEO({
  stepData,
  isLoading,
  onSave,
  isSaving,
}: {
  stepData: GeneratedSEO | null;
  isLoading: boolean;
  onSave: () => void;
  isSaving: boolean;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>SEO optimizado</p>
      {isLoading && <div className="h-48 rounded-xl animate-pulse" style={{ backgroundColor: "var(--bg-secondary)" }} />}
      {!isLoading && stepData && (
        <div className="space-y-3">
          <div className="p-3 rounded-xl" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-default)" }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>Título SEO</p>
            <p className="text-sm" style={{ color: "var(--text-primary)" }}>{stepData.title}</p>
          </div>
          <div className="p-3 rounded-xl" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-default)" }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>Descripción</p>
            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--text-primary)" }}>{stepData.description}</p>
          </div>
          <div className="p-3 rounded-xl" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-default)" }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "var(--text-muted)" }}>Tags ({stepData.tags.length})</p>
            <div className="flex flex-wrap gap-1.5">
              {stepData.tags.map((tag) => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: "var(--bg-card)", color: "var(--text-secondary)" }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="p-3 rounded-xl" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-default)" }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "var(--text-muted)" }}>Hashtags</p>
            <p className="text-sm" style={{ color: "var(--color-primary, #a855f7)" }}>
              {stepData.hashtags.map((h) => `#${h}`).join("  ")}
            </p>
          </div>
        </div>
      )}
      <Button
        onClick={onSave}
        disabled={isLoading || !stepData || isSaving}
        className="w-full"
      >
        {isSaving ? "Guardando..." : "Guardar pipeline completo"}
      </Button>
    </div>
  );
}

// ─── Main wizard ──────────────────────────────────────────────

type StepKey = "research" | "outline" | "script" | "titles" | "thumbnail" | "seo";

interface StepResponse<T> {
  data: T | null;
  loading: boolean;
}

export function ContentPipelineWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [pipelineData, setPipelineData] = useState<PipelineData>({
    topic: "",
    niche: "",
    style: "educational",
  });
  const [selectedTitle, setSelectedTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [done, setDone] = useState(false);

  const [stepStates, setStepStates] = useState<{
    research: StepResponse<RefVideo[]>;
    outline: StepResponse<Outline>;
    script: StepResponse<GeneratedScript>;
    titles: StepResponse<GeneratedTitle[]>;
    thumbnail: StepResponse<ThumbnailConcept>;
    seo: StepResponse<GeneratedSEO>;
  }>({
    research: { data: null, loading: false },
    outline: { data: null, loading: false },
    script: { data: null, loading: false },
    titles: { data: null, loading: false },
    thumbnail: { data: null, loading: false },
    seo: { data: null, loading: false },
  });

  async function generateStep(step: StepKey) {
    setStepStates((prev) => ({ ...prev, [step]: { ...prev[step], loading: true } }));

    try {
      const res = await fetch("/api/pipeline/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step,
          topic: pipelineData.topic,
          niche: pipelineData.niche,
          style: pipelineData.style,
          selectedTitle: selectedTitle || undefined,
        }),
      });

      const json = await res.json() as { data?: unknown; error?: string };
      if (!res.ok) {
        toast.error(json.error ?? `Error en paso: ${step}`);
        return;
      }

      const data = json.data as (RefVideo[] | Outline | GeneratedScript | GeneratedTitle[] | ThumbnailConcept | GeneratedSEO) | null;
      setStepStates((prev) => ({ ...prev, [step]: { data, loading: false } }));

      if (step === "research") {
        setPipelineData((prev) => ({ ...prev, referenceVideos: data as RefVideo[] }));
      } else if (step === "outline") {
        setPipelineData((prev) => ({ ...prev, outline: data as Outline }));
      } else if (step === "script") {
        setPipelineData((prev) => ({ ...prev, script: data as GeneratedScript }));
      } else if (step === "titles") {
        setPipelineData((prev) => ({ ...prev, titles: data as GeneratedTitle[] }));
      } else if (step === "thumbnail") {
        setPipelineData((prev) => ({ ...prev, thumbnail: data as ThumbnailConcept }));
      } else if (step === "seo") {
        setPipelineData((prev) => ({ ...prev, seo: data as GeneratedSEO }));
      }
    } catch {
      toast.error("Error de conexión");
      setStepStates((prev) => ({ ...prev, [step]: { ...prev[step], loading: false } }));
    }
  }

  function goToStep(next: number, step?: StepKey) {
    setCurrentStep(next);
    if (step) void generateStep(step);
  }

  async function savePipeline() {
    setIsSaving(true);
    try {
      const res = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pipelineData),
      });
      if (res.ok) {
        setDone(true);
        toast.success("Pipeline guardado exitosamente");
      } else {
        const d = await res.json() as { error?: string };
        toast.error(d.error ?? "Error al guardar");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setIsSaving(false);
    }
  }

  if (done) {
    return (
      <Card className="p-8 text-center space-y-4" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-card)" }}>
        <div className="text-4xl">✓</div>
        <p className="text-xl font-bold" style={{ color: "#22c55e" }}>Pipeline completo</p>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Tu pipeline de contenido para "{pipelineData.topic}" fue guardado en Supabase.
        </p>
        <Button onClick={() => { setCurrentStep(1); setPipelineData({ topic: "", niche: "", style: "educational" }); setSelectedTitle(""); setDone(false); setStepStates({ research: { data: null, loading: false }, outline: { data: null, loading: false }, script: { data: null, loading: false }, titles: { data: null, loading: false }, thumbnail: { data: null, loading: false }, seo: { data: null, loading: false } }); }}>
          Nuevo pipeline
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <StepIndicator current={currentStep} />

      <Card className="p-5" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-card)" }}>
        {currentStep === 1 && (
          <Step1Tema
            data={pipelineData}
            onNext={(updates) => {
              setPipelineData((prev) => ({ ...prev, ...updates }));
              goToStep(2, "research");
            }}
          />
        )}
        {currentStep === 2 && (
          <Step2Research
            data={pipelineData}
            stepData={stepStates.research.data}
            isLoading={stepStates.research.loading}
            onNext={() => goToStep(3, "outline")}
          />
        )}
        {currentStep === 3 && (
          <Step3Outline
            stepData={stepStates.outline.data}
            isLoading={stepStates.outline.loading}
            onNext={() => goToStep(4, "script")}
          />
        )}
        {currentStep === 4 && (
          <Step4Script
            stepData={stepStates.script.data}
            isLoading={stepStates.script.loading}
            onNext={() => goToStep(5, "titles")}
          />
        )}
        {currentStep === 5 && (
          <Step5Titles
            stepData={stepStates.titles.data}
            isLoading={stepStates.titles.loading}
            selectedTitle={selectedTitle}
            onSelectTitle={setSelectedTitle}
            onNext={() => goToStep(6, "thumbnail")}
          />
        )}
        {currentStep === 6 && (
          <Step6Thumbnail
            stepData={stepStates.thumbnail.data}
            isLoading={stepStates.thumbnail.loading}
            onNext={() => goToStep(7, "seo")}
          />
        )}
        {currentStep === 7 && (
          <Step7SEO
            stepData={stepStates.seo.data}
            isLoading={stepStates.seo.loading}
            onSave={() => void savePipeline()}
            isSaving={isSaving}
          />
        )}
      </Card>
    </div>
  );
}
