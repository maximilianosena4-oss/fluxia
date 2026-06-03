"use client";

import { useState } from "react";

interface SourceCitationProps {
  author: string;
  quote: string;
}

const AUTHOR_CONFIG: Record<string, { label: string; color: string; bg: string; role: string }> = {
  mrbeast:      { label: "MrBeast",       color: "var(--accent-primary)",   bg: "rgba(124,58,237,0.1)",  role: "Packaging & Engagement" },
  alex_hormozi: { label: "Alex Hormozi",  color: "var(--accent-success)",   bg: "rgba(16,185,129,0.1)",  role: "Oferta & Monetización" },
  eloisa_wolf:  { label: "Eloisa Wolf",   color: "var(--accent-warning)",   bg: "rgba(245,158,11,0.1)",  role: "RPM & Escalabilidad" },
  adrian_saenz: { label: "Adrián Sáenz",  color: "var(--accent-secondary)", bg: "rgba(139,92,246,0.1)",  role: "Estrategia de Nicho" },
  eric_alanis:  { label: "Eric Alanis",   color: "var(--accent-danger)",    bg: "rgba(239,68,68,0.1)",   role: "Canales Sin Rostro" },
};

function normalizeAuthor(raw: string): string {
  const lower = raw.toLowerCase().replace(/[^a-z_]/g, "");
  if (lower.includes("mrbeast") || lower.includes("beast")) return "mrbeast";
  if (lower.includes("hormozi")) return "alex_hormozi";
  if (lower.includes("wolf"))    return "eloisa_wolf";
  if (lower.includes("saenz") || lower.includes("sáenz") || lower.includes("adrian")) return "adrian_saenz";
  if (lower.includes("alanis") || lower.includes("eric")) return "eric_alanis";
  return lower;
}

export function SourceCitation({ author, quote }: SourceCitationProps) {
  const [expanded, setExpanded] = useState(false);
  const key = normalizeAuthor(author);
  const cfg = AUTHOR_CONFIG[key];

  if (!cfg) return null;

  const shortQuote = quote.length > 80 ? quote.slice(0, 80) + "…" : quote;

  return (
    <button
      onClick={() => setExpanded((v) => !v)}
      className="w-full text-left mt-2 rounded-lg border px-3 py-2 transition-colors"
      style={{ backgroundColor: cfg.bg, borderColor: cfg.color + "40" }}
    >
      <div className="flex items-center gap-2">
        {/* Avatar inicial */}
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ backgroundColor: cfg.color, color: "white" }}
        >
          {cfg.label[0]}
        </div>
        <span className="text-xs font-semibold" style={{ color: cfg.color }}>
          {cfg.label}
        </span>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          · {cfg.role}
        </span>
        <svg
          className="w-3 h-3 ml-auto flex-shrink-0 transition-transform"
          style={{
            color: "var(--text-muted)",
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
          }}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
        </svg>
      </div>
      <p className="text-xs mt-1 italic" style={{ color: "var(--text-secondary)" }}>
        &ldquo;{expanded ? quote : shortQuote}&rdquo;
      </p>
    </button>
  );
}
