"use client";

import { useState, useRef, useEffect } from "react";

// Nichos aprobados por Eric Alanis (8 validados) + extensiones comunes
const NICHE_SUGGESTIONS = [
  // ─── Los 8 nichos de Eric Alanis ──────────────────────────
  "Espiritualidad y motivación personal",
  "Finanzas personales e inversión",
  "Historia y curiosidades científicas",
  "Tecnología e inteligencia artificial",
  "Salud, bienestar y longevidad",
  "ASMR y meditación guiada",
  "Criptomonedas e inversión en blockchain",
  "Aprendizaje de idiomas (inglés, francés)",
  // ─── Extensiones validadas ─────────────────────────────────
  "Finanzas personales para millennials",
  "Inversión en ETFs desde cero",
  "Productividad y gestión del tiempo",
  "Marketing digital y emprendimiento",
  "Desarrollo personal y mentalidad",
  "Fitness y nutrición sin restricciones",
  "Viajes y nómadas digitales",
  "Cocina saludable y meal prep",
  "Psicología y comportamiento humano",
  "Negocios online y e-commerce",
  "Canal sin rostro con IA generativa",
  "Reviews de tecnología y gadgets",
  "Trading de acciones para principiantes",
  "Bienes raíces e inversión inmobiliaria",
  "Historia del mundo y conspiraciones",
  "Filosofía y pensamiento crítico",
  "Crianza y educación infantil",
  "Idioma inglés para hispanohablantes",
  "Derecho y leyes explicadas simple",
  "Ciencia explicada para todos",
  "Economía personal y ahorro inteligente",
];

interface NicheAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function NicheAutocomplete({ value, onChange, placeholder }: NicheAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = value.trim().length >= 2
    ? NICHE_SUGGESTIONS.filter((s) =>
        s.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 6)
    : NICHE_SUGGESTIONS.slice(0, 6);

  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, []);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setHighlighted(0); }, [value]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) { if (e.key === "ArrowDown") setOpen(true); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlighted((h) => Math.min(h + 1, suggestions.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setHighlighted((h) => Math.max(h - 1, 0)); }
    if (e.key === "Enter" && suggestions[highlighted]) {
      e.preventDefault();
      onChange(suggestions[highlighted]);
      setOpen(false);
    }
    if (e.key === "Escape") setOpen(false);
  }

  function select(suggestion: string) {
    onChange(suggestion);
    setOpen(false);
    inputRef.current?.focus();
  }

  const isEricAlanisList = (s: string) =>
    NICHE_SUGGESTIONS.indexOf(s) < 8;

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder ?? "ej: Finanzas personales para millennials"}
        autoComplete="off"
        aria-autocomplete="list"
        aria-haspopup="listbox"
        className="w-full px-4 py-3 rounded-xl text-sm outline-none border transition-colors"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: open ? "var(--accent-primary)" : "var(--border-default)",
          color: "var(--text-primary)",
        }}
      />

      {open && suggestions.length > 0 && (
        <div
          className="absolute z-50 left-0 right-0 mt-1 rounded-xl border shadow-xl overflow-hidden"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border-default)",
          }}
          role="listbox"
          aria-label="Sugerencias de nicho"
        >
          <p className="text-xs px-3 pt-2 pb-1" style={{ color: "var(--text-muted)" }}>
            Nichos validados — elegí o seguí escribiendo
          </p>
          {suggestions.map((s, i) => (
            <button
              key={s}
              role="option"
              aria-selected={i === highlighted}
              onMouseEnter={() => setHighlighted(i)}
              onClick={() => select(s)}
              className="w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 transition-colors"
              style={{
                backgroundColor: i === highlighted ? "var(--bg-secondary)" : "transparent",
                color: "var(--text-primary)",
              }}
            >
              {isEricAlanisList(s) ? (
                <span
                  className="text-xs px-1.5 py-0.5 rounded flex-shrink-0 font-medium"
                  style={{ backgroundColor: "rgba(16,185,129,0.15)", color: "var(--accent-success)" }}
                >
                  ✓
                </span>
              ) : (
                <span className="w-4 flex-shrink-0" />
              )}
              {s}
            </button>
          ))}
          {isEricAlanisList(suggestions[0]) && (
            <p className="text-xs px-3 py-2 border-t" style={{ borderColor: "var(--border-default)", color: "var(--text-muted)" }}>
              ✓ = validado por Eric Alanis (RPM &gt; $4 USD)
            </p>
          )}
        </div>
      )}
    </div>
  );
}
