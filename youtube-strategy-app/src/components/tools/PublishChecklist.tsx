"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CheckItem {
  id: string;
  label: string;
  tip?: string;
  checked: boolean;
}

interface CheckCategory {
  id: string;
  title: string;
  emoji: string;
  items: CheckItem[];
}

const INITIAL_CATEGORIES: CheckCategory[] = [
  {
    id: "seo",
    title: "SEO y metadatos",
    emoji: "🔍",
    items: [
      { id: "title", label: "Título con keyword principal en las primeras 4 palabras (< 60 chars)", tip: "YouTube trunca títulos largos en móvil. El keyword al inicio rankea mejor.", checked: false },
      { id: "description", label: "Descripción con keyword en las primeras 2 líneas visibles", tip: "YouTube indexa los primeros 125 caracteres. Incluí el link principal ahí.", checked: false },
      { id: "tags", label: "5-8 tags relevantes: keyword exacto, variaciones y long-tail", checked: false },
      { id: "chapters", label: "Capítulos / timestamps agregados en la descripción", tip: "Mejoran el watch-time y aparecen como rich snippets en Google.", checked: false },
    ],
  },
  {
    id: "thumbnail",
    title: "Thumbnail",
    emoji: "🖼️",
    items: [
      { id: "thumb-text", label: "Texto legible en pantalla de móvil (máximo 6 palabras)", checked: false },
      { id: "thumb-contrast", label: "Alto contraste: fondo oscuro / texto claro o viceversa", checked: false },
      { id: "thumb-brand", label: "Coherencia visual con el estilo del canal", checked: false },
      { id: "thumb-size", label: "Resolución 1280×720 px, formato JPG/PNG/WebP < 2 MB", checked: false },
    ],
  },
  {
    id: "video",
    title: "Contenido del video",
    emoji: "🎬",
    items: [
      { id: "hook", label: "Hook potente en los primeros 30 segundos", tip: "Si el espectador no engancha aquí, abandona. Usá el Generador de Hooks.", checked: false },
      { id: "audio", label: "Audio limpio: sin ruido de fondo, volumen estable", checked: false },
      { id: "cta", label: "CTA claro hacia suscripción, like o próximo video", checked: false },
      { id: "endscreen", label: "Pantalla final configurada con video sugerido o lista", checked: false },
      { id: "captions", label: "Subtítulos subidos o auto-generados revisados", tip: "Los subtítulos mejoran retención y accesibilidad. YouTube los indexa.", checked: false },
    ],
  },
  {
    id: "config",
    title: "Configuración de publicación",
    emoji: "⚙️",
    items: [
      { id: "category", label: "Categoría correcta seleccionada en YouTube Studio", checked: false },
      { id: "lang", label: "Idioma del video configurado", checked: false },
      { id: "audience", label: "Audiencia definida (hecho para niños: No, salvo que aplique)", checked: false },
      { id: "monetization", label: "Monetización habilitada si el video califica", checked: false },
      { id: "schedule", label: "Premiere o publicación inmediata: decidido y configurado", checked: false },
    ],
  },
  {
    id: "promo",
    title: "Promoción post-publicación",
    emoji: "📢",
    items: [
      { id: "pinned", label: "Comentario fijado con link, recurso o pregunta de engagement", checked: false },
      { id: "community", label: "Post en pestaña Comunidad si tenés acceso", checked: false },
      { id: "share", label: "Compartido en redes sociales o grupos del nicho", checked: false },
    ],
  },
];

export function PublishChecklist() {
  const [categories, setCategories] = useState<CheckCategory[]>(
    INITIAL_CATEGORIES.map((cat) => ({
      ...cat,
      items: cat.items.map((item) => ({ ...item })),
    }))
  );
  const [expandedTip, setExpandedTip] = useState<string | null>(null);

  const allItems = categories.flatMap((c) => c.items);
  const checkedCount = allItems.filter((i) => i.checked).length;
  const totalCount = allItems.length;
  const pct = Math.round((checkedCount / totalCount) * 100);
  const isComplete = checkedCount === totalCount;

  function toggle(catId: string, itemId: string) {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id !== catId
          ? cat
          : {
              ...cat,
              items: cat.items.map((item) =>
                item.id !== itemId ? item : { ...item, checked: !item.checked }
              ),
            }
      )
    );
  }

  function toggleCategory(catId: string, checked: boolean) {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id !== catId
          ? cat
          : { ...cat, items: cat.items.map((item) => ({ ...item, checked })) }
      )
    );
  }

  function reset() {
    setCategories(
      INITIAL_CATEGORIES.map((cat) => ({
        ...cat,
        items: cat.items.map((item) => ({ ...item })),
      }))
    );
    setExpandedTip(null);
    toast.success("Checklist reseteado");
  }

  function copyMissing() {
    const missing = categories
      .flatMap((cat) =>
        cat.items
          .filter((i) => !i.checked)
          .map((i) => `• [${cat.title}] ${i.label}`)
      )
      .join("\n");

    if (!missing) {
      toast.success("¡Todo completo! No hay pendientes.");
      return;
    }
    void navigator.clipboard.writeText(`Pendientes antes de publicar:\n\n${missing}`);
    toast.success("Pendientes copiados al portapapeles");
  }

  return (
    <div className="space-y-5">
      {/* Header con progreso */}
      <div
        className="rounded-xl border p-5 space-y-3"
        style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <span
              className="text-2xl font-black tabular-nums"
              style={{ color: isComplete ? "var(--accent-success)" : "var(--accent-primary)" }}
            >
              {checkedCount}/{totalCount}
            </span>
            <span className="text-sm ml-2" style={{ color: "var(--text-secondary)" }}>
              ítems completados · {pct}%
            </span>
          </div>
          <span className="text-3xl">
            {isComplete ? "🚀" : pct >= 60 ? "⚡" : "📋"}
          </span>
        </div>

        {/* Barra de progreso */}
        <div
          className="h-2.5 rounded-full overflow-hidden"
          style={{ backgroundColor: "var(--bg-card)" }}
        >
          <motion.div
            className="h-full rounded-full"
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{
              backgroundColor: isComplete
                ? "var(--accent-success)"
                : "var(--accent-primary)",
            }}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={copyMissing}>
            📋 Copiar pendientes
          </Button>
          <Button variant="ghost" size="sm" onClick={reset}>
            ↺ Reiniciar
          </Button>
        </div>
      </div>

      {/* Categorías */}
      <div className="space-y-4">
        {categories.map((cat, ci) => {
          const catChecked = cat.items.filter((i) => i.checked).length;
          const catDone = catChecked === cat.items.length;

          return (
            <Card
              key={cat.id}
              style={{
                borderColor: catDone
                  ? "var(--border-accent)"
                  : "var(--border-default)",
              }}
            >
              <CardContent className="pt-0">
                {/* Encabezado categoría */}
                <div
                  className="flex items-center justify-between pt-5 pb-3 border-b"
                  style={{ borderColor: "var(--border-default)" }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{cat.emoji}</span>
                    <span
                      className="font-semibold text-sm"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {cat.title}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: "var(--bg-secondary)",
                        color: "var(--text-muted)",
                      }}
                    >
                      {catChecked}/{cat.items.length}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleCategory(cat.id, !catDone)}
                    className="text-xs hover:underline"
                    style={{ color: "var(--accent-primary)" }}
                  >
                    {catDone ? "Desmarcar todo" : "Marcar todo"}
                  </button>
                </div>

                {/* Items */}
                <div className="space-y-0.5 pt-2">
                  {cat.items.map((item, ii) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: ci * 0.03 + ii * 0.03 }}
                    >
                      <div
                        className="flex items-start gap-3 py-2.5 px-2 rounded-lg cursor-pointer transition-colors"
                        style={{ backgroundColor: "transparent" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "var(--bg-secondary)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "transparent")
                        }
                        onClick={() => toggle(cat.id, item.id)}
                      >
                        {/* Checkbox */}
                        <div
                          className="mt-0.5 w-4 h-4 flex-shrink-0 rounded border-2 flex items-center justify-center transition-all"
                          style={{
                            borderColor: item.checked
                              ? "var(--accent-primary)"
                              : "var(--border-default)",
                            backgroundColor: item.checked
                              ? "var(--accent-primary)"
                              : "transparent",
                          }}
                        >
                          {item.checked && (
                            <motion.svg
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", duration: 0.3 }}
                              width="10"
                              height="10"
                              viewBox="0 0 10 10"
                              fill="none"
                            >
                              <path
                                d="M1.5 5L3.8 7.5L8.5 2.5"
                                stroke="white"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </motion.svg>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <span
                            className="text-sm leading-snug"
                            style={{
                              color: item.checked
                                ? "var(--text-muted)"
                                : "var(--text-primary)",
                              textDecoration: item.checked
                                ? "line-through"
                                : "none",
                            }}
                          >
                            {item.label}
                          </span>

                          {item.tip && (
                            <button
                              className="ml-1.5 text-xs align-middle"
                              style={{ color: "var(--accent-primary)" }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedTip(
                                  expandedTip === item.id ? null : item.id
                                );
                              }}
                            >
                              ℹ︎
                            </button>
                          )}

                          <AnimatePresence>
                            {item.tip && expandedTip === item.id && (
                              <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-xs mt-1 leading-relaxed overflow-hidden"
                                style={{ color: "var(--text-muted)" }}
                              >
                                💡 {item.tip}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Banner de completado */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-xl border p-5 text-center"
            style={{
              backgroundColor: "rgba(16,185,129,0.1)",
              borderColor: "rgba(16,185,129,0.3)",
            }}
          >
            <div className="text-3xl mb-2">🚀</div>
            <p className="font-bold" style={{ color: "var(--accent-success)" }}>
              ¡Todo listo para publicar!
            </p>
            <p
              className="text-sm mt-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Revisaste los {totalCount} puntos. Tu video está optimizado al máximo.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
