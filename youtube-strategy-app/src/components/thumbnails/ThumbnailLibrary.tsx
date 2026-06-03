"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ThumbnailConcept {
  id: string;
  title: string;
  prompt: string;
  style: ThumbnailStyle;
  ctrTip: string;
  createdAt: string;
  status: "idea" | "in-progress" | "done";
}

type ThumbnailStyle = "impact" | "curiosity" | "tutorial" | "listicle" | "story";

const STYLES: Array<{ value: ThumbnailStyle; label: string; desc: string; emoji: string; elements: string[] }> = [
  {
    value: "impact",
    label: "Alto impacto",
    desc: "Gran texto, colores contrastantes, cara expresiva",
    emoji: "💥",
    elements: ["Texto grande en 3 palabras máx", "Fondo oscuro o vibrante", "Cara con expresión intensa (si aplica)", "Flecha o círculo señalador"],
  },
  {
    value: "curiosity",
    label: "Curiosidad",
    desc: "Deja algo sin resolver, crea tensión",
    emoji: "🤔",
    elements: ["Pregunta o afirmación incompleta", "Elemento oculto o censurado", "Expresión de sorpresa/shock", "Color: amarillo + negro"],
  },
  {
    value: "tutorial",
    label: "Tutorial / How-to",
    desc: "Claro, limpio, con paso a paso implícito",
    emoji: "📚",
    elements: ["Número destacado (ej: '5 pasos')", "Icono o símbolo del tema", "Fondo claro o gradiente suave", "Tipografía bold y legible"],
  },
  {
    value: "listicle",
    label: "Lista / Ranking",
    desc: "Números grandes, expectativa de valor",
    emoji: "🏆",
    elements: ["Número muy grande (ej: '10x')", "Podio o lista visual", "Contraste entre elementos", "Badge o sello de calidad"],
  },
  {
    value: "story",
    label: "Historia / Caso",
    desc: "Narrativa visual, antes/después",
    emoji: "📖",
    elements: ["Flecha de transformación", "Imagen antes vs después", "Elemento personal o real", "Tipografía narrativa"],
  },
];

const TEMPLATES: Array<{ title: string; prompt: string; style: ThumbnailStyle; ctrTip: string }> = [
  {
    title: "El secreto que nadie te dice",
    prompt: "Fondo negro. Texto grande blanco: 'EL SECRETO'. Subtexto rojo: 'que nadie te dice'. Persona con dedo en los labios (o icono de candado). Efecto de luz dramático desde arriba. Colores: negro, blanco, rojo.",
    style: "curiosity",
    ctrTip: "El misterio aumenta el CTR un 23% según estudios de YouTube. Nunca reveles el secreto en el thumbnail.",
  },
  {
    title: "De $0 a $X en Y días",
    prompt: "Fondo oscuro. Texto grande: '$0 → $X,XXX'. Subtexto: 'en 90 días'. Flecha ascendente verde brillante. Gráfico de línea subiendo. Colores: negro, verde, blanco.",
    style: "impact",
    ctrTip: "Los números concretos aumentan la credibilidad. Asegurate de que el número sea alcanzable y real.",
  },
  {
    title: "X errores que todos cometen",
    prompt: "Fondo rojo o naranja. Número grande en blanco: 'X errores'. Icono de X o prohibición. Cara de advertencia (si aplica) o ícono de advertencia. Tipografía bold impactante.",
    style: "impact",
    ctrTip: "El miedo a perder (loss aversion) activa más que el deseo de ganar. 'Errores' tiene más CTR que 'consejos'.",
  },
  {
    title: "Tutorial paso a paso",
    prompt: "Fondo gradiente azul/morado. Texto: 'GUÍA COMPLETA'. Icono del software o tema. Números 1-2-3 en círculos. Borde redondeado. Colores: azul, blanco, acentos dorados.",
    style: "tutorial",
    ctrTip: "Las palabras 'completa' y 'definitiva' señalan valor exhaustivo. El espectador sabe que no necesita buscar más.",
  },
  {
    title: "Ranking / Top X",
    prompt: "Fondo oscuro. Podio con 3 posiciones marcadas (1, 2, 3). Íconos o logos de los elementos rankeados. Texto: 'RANKING'. Corona o trofeo en el puesto #1. Colores: dorado, plateado, bronce.",
    style: "listicle",
    ctrTip: "Los rankings generan debate en comentarios, lo que amplifica el algoritmo. Poné el #1 visible pero con poco contexto.",
  },
];

const INITIAL: ThumbnailConcept[] = TEMPLATES.map((t, i) => ({
  id: `template-${i}`,
  ...t,
  createdAt: new Date().toISOString(),
  status: "idea",
}));

interface ThumbnailLibraryProps {
  initialTitle?: string;
  initialPrompt?: string;
}

export function ThumbnailLibrary({ initialTitle = "", initialPrompt = "" }: ThumbnailLibraryProps) {
  const [concepts, setConcepts] = useState<ThumbnailConcept[]>(INITIAL);
  const [newTitle, setNewTitle] = useState(initialTitle);
  const [newPrompt, setNewPrompt] = useState(initialPrompt);
  const [selectedStyle, setSelectedStyle] = useState<ThumbnailStyle>("impact");
  const [filter, setFilter] = useState<"all" | ThumbnailStyle>("all");
  const [generating, setGenerating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function addCustom() {
    if (!newTitle.trim() || !newPrompt.trim()) {
      toast.error("Completá el título y el prompt");
      return;
    }
    const concept: ThumbnailConcept = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      prompt: newPrompt.trim(),
      style: selectedStyle,
      ctrTip: "Probá varias variaciones del mismo concepto y elegí la que tenga mayor CTR a las 48hs.",
      createdAt: new Date().toISOString(),
      status: "idea",
    };
    setConcepts((prev) => [concept, ...prev]);
    setNewTitle("");
    setNewPrompt("");
    toast.success("Concepto agregado a la biblioteca");
  }

  async function generateWithAI() {
    if (!newTitle.trim()) {
      toast.error("Escribí el título del video primero");
      return;
    }
    setGenerating(true);

    // Generar prompt basado en el estilo seleccionado
    const styleInfo = STYLES.find((s) => s.value === selectedStyle)!;
    const generatedPrompt = [
      `Thumbnail para video: "${newTitle}"`,
      `Estilo: ${styleInfo.label}`,
      `Elementos clave: ${styleInfo.elements.join(", ")}`,
      `Paleta: colores llamativos y contrastantes`,
      `Texto en pantalla máx. 5 palabras`,
      `Optimizado para miniatura de 1280x720px`,
    ].join(". ");

    await new Promise((r) => setTimeout(r, 800)); // Simular procesamiento

    const concept: ThumbnailConcept = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      prompt: generatedPrompt,
      style: selectedStyle,
      ctrTip: styleInfo.elements[0] + ". " + "A/B testeá este thumbnail con uno alternativo a las 48h.",
      createdAt: new Date().toISOString(),
      status: "idea",
    };

    setConcepts((prev) => [concept, ...prev]);
    setNewTitle("");
    toast.success("Concepto generado. Copiá el prompt para Midjourney o DALL-E.");
    setGenerating(false);
  }

  function updateStatus(id: string, status: ThumbnailConcept["status"]) {
    setConcepts((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));
    toast.success(status === "done" ? "¡Thumbnail listo! 🎨" : "Estado actualizado");
  }

  function copyPrompt(prompt: string) {
    void navigator.clipboard.writeText(prompt);
    toast.success("Prompt copiado — pegalo en Midjourney o DALL-E");
  }

  function remove(id: string) {
    setConcepts((prev) => prev.filter((c) => c.id !== id));
    toast.info("Concepto eliminado");
  }

  const filtered = filter === "all" ? concepts : concepts.filter((c) => c.style === filter);

  const statusColors = { idea: "var(--accent-primary)", "in-progress": "var(--accent-warning)", done: "var(--accent-success)" };
  const statusLabels = { idea: "💡 Idea", "in-progress": "🎨 En progreso", done: "✅ Listo" };

  return (
    <div className="space-y-6">
      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", value: concepts.length, color: "var(--accent-primary)" },
          { label: "En progreso", value: concepts.filter((c) => c.status === "in-progress").length, color: "var(--accent-warning)" },
          { label: "Listos", value: concepts.filter((c) => c.status === "done").length, color: "var(--accent-success)" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border p-4 text-center"
            style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}>
            <p className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Crear nuevo */}
      <Card>
        <CardHeader><CardTitle>Nuevo concepto de thumbnail</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {/* Estilo */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Estilo</label>
            <div className="flex flex-wrap gap-2">
              {STYLES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSelectedStyle(s.value)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-all"
                  style={{
                    backgroundColor: selectedStyle === s.value ? "var(--accent-primary)20" : "var(--bg-card)",
                    borderColor: selectedStyle === s.value ? "var(--accent-primary)" : "var(--border-default)",
                    color: selectedStyle === s.value ? "var(--accent-primary)" : "var(--text-secondary)",
                  }}
                >
                  {s.emoji} {s.label}
                </button>
              ))}
            </div>
            {selectedStyle && (
              <div className="rounded-lg p-3 mt-1" style={{ backgroundColor: "var(--bg-card)" }}>
                <p className="text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  {STYLES.find((s) => s.value === selectedStyle)?.desc}
                </p>
                <div className="flex flex-wrap gap-1">
                  {STYLES.find((s) => s.value === selectedStyle)?.elements.map((el) => (
                    <span key={el} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-muted)" }}>
                      {el}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Título del video (ej: Cómo ganar $1000 con YouTube)"
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent-primary)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
          />

          <textarea
            value={newPrompt}
            onChange={(e) => setNewPrompt(e.target.value)}
            placeholder="Prompt para IA (descripción visual del thumbnail)..."
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border resize-none"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent-primary)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
          />

          <div className="flex gap-2">
            <Button onClick={() => void generateWithAI()} loading={generating} variant="secondary" size="sm">
              ✨ Auto-generar prompt
            </Button>
            <Button onClick={addCustom} size="sm" disabled={!newTitle.trim() || !newPrompt.trim()}>
              + Agregar manual
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className="px-3 py-1 rounded-lg text-xs border transition-all"
          style={{
            backgroundColor: filter === "all" ? "var(--accent-primary)" : "var(--bg-secondary)",
            borderColor: filter === "all" ? "var(--accent-primary)" : "var(--border-default)",
            color: filter === "all" ? "white" : "var(--text-secondary)",
          }}
        >
          Todos ({concepts.length})
        </button>
        {STYLES.map((s) => {
          const count = concepts.filter((c) => c.style === s.value).length;
          return (
            <button
              key={s.value}
              onClick={() => setFilter(s.value)}
              className="px-3 py-1 rounded-lg text-xs border transition-all"
              style={{
                backgroundColor: filter === s.value ? "var(--accent-primary)" : "var(--bg-secondary)",
                borderColor: filter === s.value ? "var(--accent-primary)" : "var(--border-default)",
                color: filter === s.value ? "white" : "var(--text-secondary)",
              }}
            >
              {s.emoji} {s.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Grid de conceptos */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map((concept, i) => (
            <motion.div
              key={concept.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card style={{ borderColor: concept.status === "done" ? "rgba(16,185,129,0.3)" : "var(--border-default)" }}>
                <button className="w-full p-5 text-left" onClick={() => setExpandedId(expandedId === concept.id ? null : concept.id)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base">{STYLES.find((s) => s.value === concept.style)?.emoji}</span>
                        <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{concept.title}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: `${statusColors[concept.status]}20`, color: statusColors[concept.status] }}>
                          {statusLabels[concept.status]}
                        </span>
                      </div>
                      <p className="text-xs mt-1 truncate" style={{ color: "var(--text-muted)" }}>
                        {concept.prompt.slice(0, 80)}...
                      </p>
                    </div>
                    <svg className="w-4 h-4 flex-shrink-0 transition-transform" style={{ color: "var(--text-muted)", transform: expandedId === concept.id ? "rotate(180deg)" : "rotate(0)" }}
                      fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                <AnimatePresence>
                  {expandedId === concept.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 space-y-4 border-t pt-4" style={{ borderColor: "var(--border-default)" }}>
                        {/* Prompt */}
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: "var(--text-muted)" }}>
                            Prompt para IA (Midjourney / DALL-E)
                          </p>
                          <div className="rounded-xl p-4 text-sm leading-relaxed"
                            style={{ backgroundColor: "var(--bg-card)", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>
                            {concept.prompt}
                          </div>
                        </div>

                        {/* CTR Tip */}
                        <div className="rounded-lg px-4 py-3 flex items-start gap-2"
                          style={{ backgroundColor: "var(--accent-warning)10", borderLeft: "3px solid var(--accent-warning)" }}>
                          <span>💡</span>
                          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                            <strong>Consejo CTR:</strong> {concept.ctrTip}
                          </p>
                        </div>

                        {/* Acciones */}
                        <div className="flex flex-wrap gap-2">
                          <Button variant="primary" size="sm" onClick={() => copyPrompt(concept.prompt)}>
                            📋 Copiar prompt
                          </Button>
                          {concept.status === "idea" && (
                            <Button variant="secondary" size="sm" onClick={() => updateStatus(concept.id, "in-progress")}>
                              🎨 Marcar en progreso
                            </Button>
                          )}
                          {concept.status === "in-progress" && (
                            <Button variant="secondary" size="sm" onClick={() => updateStatus(concept.id, "done")}>
                              ✅ Marcar listo
                            </Button>
                          )}
                          <button
                            onClick={() => remove(concept.id)}
                            className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                            style={{ color: "var(--text-muted)" }}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
