"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { VideoScript } from "@/app/api/ai/script/route";
import { useEvaluatorStore } from "@/store/useEvaluatorStore";

type ChannelType = "no-face-ai" | "voice-only" | "with-face";
type Duration = "short" | "medium" | "long";

const CHANNEL_TYPES: Array<{ value: ChannelType; label: string; desc: string; icon: string }> = [
  { value: "no-face-ai", label: "Sin cara con IA", desc: "Voz generada + B-roll", icon: "🤖" },
  { value: "voice-only", label: "Mi voz", desc: "Narración propia + B-roll", icon: "🎙️" },
  { value: "with-face", label: "Con mi cara", desc: "Cámara frontal", icon: "🎥" },
];

const DURATIONS: Array<{ value: Duration; label: string; desc: string }> = [
  { value: "short", label: "Corto", desc: "6-8 min" },
  { value: "medium", label: "Medio", desc: "10-15 min" },
  { value: "long", label: "Largo", desc: "18-25 min" },
];

interface ScriptGeneratorProps {
  initialTitle?: string;
  initialHook?: string;
}

export function ScriptGenerator({ initialTitle = "", initialHook = "" }: ScriptGeneratorProps) {
  const { nicheName } = useEvaluatorStore();

  const [title, setTitle] = useState(initialTitle);
  const [niche, setNiche] = useState(nicheName || "");
  const [targetAudience, setTargetAudience] = useState("");
  const [channelType, setChannelType] = useState<ChannelType>("no-face-ai");
  const [duration, setDuration] = useState<Duration>("medium");
  const fromFactory = Boolean(initialTitle || initialHook);
  const [isLoading, setIsLoading] = useState(false);
  const [script, setScript] = useState<VideoScript | null>(null);
  const [expandedSection, setExpandedSection] = useState<number | null>(0);
  const [copied, setCopied] = useState(false);

  async function generate() {
    if (!title.trim() || !niche.trim()) {
      toast.error("Completá el título y el nicho");
      return;
    }
    setIsLoading(true);
    setScript(null);

    try {
      const res = await fetch("/api/ai/script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:          title.trim(),
          niche:          niche.trim(),
          hook:           initialHook.trim() || undefined,
          targetAudience: targetAudience.trim() || undefined,
          channelType,
          videoDuration:  duration,
        }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        toast.error(data.error ?? "Error al generar el guión");
        return;
      }

      const data = await res.json() as { script: VideoScript };
      setScript(data.script);
      setExpandedSection(0);
      toast.success("¡Guión generado! Revisá cada sección.");
    } catch {
      toast.error("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  }

  function copyFullScript() {
    if (!script) return;
    const text = [
      `# ${script.title}`,
      `Duración: ${script.estimatedDuration}`,
      "",
      ...script.sections.map((s) =>
        `## ${s.name} (${s.timeCode})\n**Objetivo:** ${s.objective}\n\n${s.content}\n\n💡 **Nota de producción:** ${s.productionTip}`
      ),
      "",
      "## Notas generales",
      ...script.productionNotes.map((n) => `- ${n}`),
      "",
      "## Tags SEO",
      script.seoTags.join(", "),
      "",
      "## Concepto de thumbnail",
      script.thumbnailConcept,
    ].join("\n\n");

    void navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Guión copiado al portapapeles");
  }

  return (
    <div className="space-y-6">
      {/* Formulario */}
      <Card>
        <CardHeader>
          <CardTitle>Configurar guión</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Badge: pre-llenado desde Content Factory */}
          {fromFactory && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
              style={{ backgroundColor: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", color: "var(--accent-primary)" }}
            >
              <span>💡</span>
              <span>
                Pre-llenado desde <strong>Content Factory</strong>
                {initialHook && " · hook sugerido incluido"}
              </span>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                Título del video *
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ej: Cómo ganar $1000 con finanzas personales"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition-colors"
                style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent-primary)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                Nicho *
              </label>
              <input
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="ej: Finanzas personales en español"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition-colors"
                style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent-primary)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
              />
            </div>
          </div>

          {/* Audiencia objetivo */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Audiencia objetivo <span style={{ color: "var(--text-muted)" }}>(opcional)</span>
            </label>
            <input
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="ej: Millennials de 25-35 años que quieren invertir por primera vez"
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition-colors"
              style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent-primary)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
            />
          </div>

          {/* Tipo de canal */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Tipo de canal
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CHANNEL_TYPES.map((ct) => (
                <button
                  key={ct.value}
                  onClick={() => setChannelType(ct.value)}
                  className="p-3 rounded-xl border text-center transition-all"
                  style={{
                    backgroundColor: channelType === ct.value ? "var(--accent-primary)20" : "var(--bg-card)",
                    borderColor: channelType === ct.value ? "var(--accent-primary)" : "var(--border-default)",
                  }}
                >
                  <div className="text-xl mb-1">{ct.icon}</div>
                  <p className="text-xs font-semibold" style={{ color: channelType === ct.value ? "var(--accent-primary)" : "var(--text-primary)" }}>
                    {ct.label}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{ct.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Duración */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Duración del video
            </label>
            <div className="flex gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDuration(d.value)}
                  className="flex-1 py-2.5 px-3 rounded-xl border text-center transition-all"
                  style={{
                    backgroundColor: duration === d.value ? "var(--accent-primary)20" : "var(--bg-card)",
                    borderColor: duration === d.value ? "var(--accent-primary)" : "var(--border-default)",
                    color: duration === d.value ? "var(--accent-primary)" : "var(--text-secondary)",
                  }}
                >
                  <p className="text-sm font-semibold">{d.label}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{d.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={() => void generate()}
            loading={isLoading}
            size="lg"
            className="w-full"
          >
            {isLoading ? "Generando guión..." : "✍️ Generar guión completo"}
          </Button>
        </CardContent>
      </Card>

      {/* Resultado */}
      <AnimatePresence>
        {script && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Header del guión */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                  {script.title}
                </h2>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {script.estimatedDuration} · {script.sections.length} secciones
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={copyFullScript}
              >
                {copied ? "✓ Copiado" : "📋 Copiar todo"}
              </Button>
            </div>

            {/* Secciones del guión */}
            <div className="space-y-3">
              {script.sections.map((section, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Card style={{ borderColor: expandedSection === i ? "var(--border-accent)" : "var(--border-default)" }}>
                    <button
                      className="w-full p-5 text-left"
                      onClick={() => setExpandedSection(expandedSection === i ? null : i)}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ backgroundColor: "var(--accent-primary)20", color: "var(--accent-primary)" }}
                          >
                            {i + 1}
                          </span>
                          <div>
                            <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                              {section.name}
                            </p>
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                              {section.timeCode} · {section.duration}
                            </p>
                          </div>
                        </div>
                        <svg
                          className="w-4 h-4 flex-shrink-0 transition-transform"
                          style={{
                            color: "var(--text-muted)",
                            transform: expandedSection === i ? "rotate(180deg)" : "rotate(0)",
                          }}
                          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    <AnimatePresence>
                      {expandedSection === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 space-y-4 border-t pt-4" style={{ borderColor: "var(--border-default)" }}>
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>
                                Objetivo
                              </p>
                              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                                {section.objective}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: "var(--text-muted)" }}>
                                Guión
                              </p>
                              <div
                                className="rounded-xl p-4 text-sm whitespace-pre-wrap leading-relaxed"
                                style={{ backgroundColor: "var(--bg-card)", color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}
                              >
                                {section.content}
                              </div>
                            </div>
                            <div
                              className="rounded-lg px-4 py-3 flex items-start gap-2"
                              style={{ backgroundColor: "var(--accent-primary)10", borderLeft: "3px solid var(--accent-primary)" }}
                            >
                              <span>💡</span>
                              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                                <strong>Producción:</strong> {section.productionTip}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Notas + SEO + Thumbnail */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle className="text-sm">📝 Notas de producción</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {script.productionNotes.map((note, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                        <span style={{ color: "var(--accent-success)" }}>•</span>
                        {note}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card>
                  <CardHeader><CardTitle className="text-sm">🏷️ Tags SEO</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                      {script.seoTags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 rounded-full"
                          style={{ backgroundColor: "var(--bg-card)", color: "var(--text-secondary)" }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-sm">🖼️ Concepto de thumbnail</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {script.thumbnailConcept}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
