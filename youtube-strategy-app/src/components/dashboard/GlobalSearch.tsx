"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface SearchItem {
  label: string;
  description: string;
  href: string;
  icon: string;
}

const SEARCH_ITEMS: SearchItem[] = [
  { label: "Inicio",                description: "Panel principal con métricas",              href: "/dashboard",              icon: "🏠" },
  { label: "Evaluar Nicho",         description: "Wizard de evaluación de nicho",             href: "/dashboard/evaluator",    icon: "⚡" },
  { label: "Analytics",             description: "Análisis de rendimiento del canal",         href: "/dashboard/analytics",    icon: "📊" },
  { label: "Calendario",            description: "Planificá tu contenido semanal",            href: "/dashboard/calendar",     icon: "📅" },
  { label: "Generador de Guiones",  description: "Crea guiones optimizados para YouTube",    href: "/dashboard/scripts",      icon: "✍️" },
  { label: "Consultor IA",          description: "Chat con consultor estratégico de YouTube", href: "/dashboard/consultant",   icon: "🤖" },
  { label: "Plan de Acción",        description: "Roadmap de pasos hacia monetización",       href: "/dashboard/roadmap",      icon: "🗺️" },
  { label: "Content Factory",       description: "Generador masivo de ideas de contenido",   href: "/dashboard/ideas",        icon: "💡" },
  { label: "Thumbnails",            description: "Biblioteca y generador de thumbnails",     href: "/dashboard/thumbnails",   icon: "🖼️" },
  { label: "Herramientas",          description: "Hooks · Checklist · Keyword research",     href: "/dashboard/tools",        icon: "🛠️" },
  { label: "Comparador de Nichos",  description: "Comparación lado a lado de nichos",        href: "/dashboard/comparator",   icon: "⚖️" },
  { label: "Configuración",         description: "Ajustes de perfil y canal",                href: "/dashboard/settings",     icon: "⚙️" },
];

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

export function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const results =
    query.trim()
      ? SEARCH_ITEMS.filter(
          (item) =>
            item.label.toLowerCase().includes(query.toLowerCase()) ||
            item.description.toLowerCase().includes(query.toLowerCase())
        )
      : SEARCH_ITEMS;

  // Resetear estado cuando el modal abre/cierra
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);
  useEffect(() => { setSelected(0); }, [query]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const navigate = useCallback(
    (href: string) => {
      router.push(href);
      onClose();
    },
    [router, onClose]
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((s) => Math.min(s + 1, results.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
      }
      if (e.key === "Enter" && results[selected]) {
        navigate(results[selected].href);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, results, selected, navigate]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -10 }}
            transition={{ duration: 0.14 }}
            className="fixed top-[18vh] left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4"
            role="dialog"
            aria-modal="true"
            aria-label="Búsqueda global de FluxIA"
          >
            <div
              className="rounded-2xl border shadow-2xl overflow-hidden"
              style={{
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border-default)",
              }}
            >
              {/* Input row */}
              <div
                className="flex items-center gap-3 px-4 py-3.5 border-b"
                style={{ borderColor: "var(--border-default)" }}
              >
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                  style={{ color: "var(--text-muted)" }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar en FluxIA…"
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: "var(--text-primary)" }}
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="text-xs px-1.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    ✕
                  </button>
                )}
                <kbd
                  className="hidden sm:inline text-xs px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    color: "var(--text-muted)",
                    border: "1px solid var(--border-default)",
                    fontFamily: "inherit",
                  }}
                >
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-72 overflow-y-auto py-1">
                {results.length === 0 ? (
                  <p className="text-sm text-center py-8" style={{ color: "var(--text-muted)" }}>
                    Sin resultados para &ldquo;{query}&rdquo;
                  </p>
                ) : (
                  results.map((item, i) => (
                    <button
                      key={item.href}
                      onClick={() => navigate(item.href)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                      style={{
                        backgroundColor:
                          i === selected ? "var(--bg-secondary)" : "transparent",
                      }}
                      onMouseEnter={() => setSelected(i)}
                    >
                      <span className="text-xl w-8 flex-shrink-0 text-center">
                        {item.icon}
                      </span>
                      <div className="min-w-0">
                        <p
                          className="text-sm font-medium leading-tight"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {item.label}
                        </p>
                        <p
                          className="text-xs mt-0.5 truncate"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {item.description}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Footer */}
              <div
                className="flex items-center gap-4 px-4 py-2 border-t text-xs"
                style={{
                  borderColor: "var(--border-default)",
                  color: "var(--text-muted)",
                }}
              >
                <span style={{ fontFamily: "inherit" }}>↑↓ navegar</span>
                <span style={{ fontFamily: "inherit" }}>↵ ir</span>
                <span style={{ fontFamily: "inherit" }}>ESC cerrar</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
