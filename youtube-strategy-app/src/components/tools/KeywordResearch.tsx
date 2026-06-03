"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Competition = "baja" | "media" | "alta";

interface Keyword {
  keyword: string;
  volume: string;
  competition: Competition;
  rpm: string;
  score: number;
}

const COMP_CONFIG: Record<Competition, { label: string; color: string; bg: string }> = {
  baja:  { label: "Baja",  color: "var(--accent-success)", bg: "rgba(16,185,129,0.12)" },
  media: { label: "Media", color: "var(--accent-warning)", bg: "rgba(245,158,11,0.12)" },
  alta:  { label: "Alta",  color: "var(--accent-danger)",  bg: "rgba(239,68,68,0.12)"  },
};

const VARIANTS = [
  { suffix: " para principiantes",        volume: "8.200",  comp: "baja",  rpm: "$4.20" },
  { prefix: "cómo ",   suffix: " paso a paso",       volume: "22.400", comp: "media", rpm: "$3.80" },
  { suffix: " sin experiencia",           volume: "5.600",  comp: "baja",  rpm: "$4.50" },
  { prefix: "guía de ", suffix: " 2025", volume: "31.000", comp: "media", rpm: "$3.20" },
  { suffix: " desde cero",                volume: "18.700", comp: "baja",  rpm: "$5.10" },
  { prefix: "tutorial de ", suffix: "",  volume: "44.200", comp: "alta",  rpm: "$2.90" },
  { prefix: "ganar dinero con ", suffix: "", volume: "62.000", comp: "alta", rpm: "$6.80" },
  { suffix: " en 2025",                   volume: "27.800", comp: "media", rpm: "$3.60" },
  { prefix: "estrategias de ", suffix: "", volume: "9.400", comp: "baja",  rpm: "$5.40" },
  { suffix: " gratis",                    volume: "13.200", comp: "media", rpm: "$2.10" },
  { prefix: "errores en ", suffix: "",   volume: "6.800",  comp: "baja",  rpm: "$4.80" },
  { suffix: " avanzado",                  volume: "4.100",  comp: "baja",  rpm: "$6.20" },
] as const;

function generateKeywords(seed: string): Keyword[] {
  const scoreBase: Record<Competition, number> = { baja: 72, media: 44, alta: 18 };

  return VARIANTS.map((v) => {
    const comp = v.comp as Competition;
    const prefix = "prefix" in v && v.prefix ? v.prefix : "";
    const suffix = v.suffix ? ` ${v.suffix}`.trimEnd() : "";
    const keyword = `${prefix}${seed}${suffix}`.trim();
    const volNum = parseInt(v.volume.replace(".", ""));
    const rpmNum = parseFloat(v.rpm.replace("$", ""));
    const score = Math.min(100, scoreBase[comp] + Math.round((volNum / 8000) + rpmNum * 1.5));
    return { keyword, volume: v.volume, competition: comp, rpm: v.rpm, score };
  }).sort((a, b) => b.score - a.score);
}

export function KeywordResearch() {
  const [seed, setSeed] = useState("");
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filter, setFilter] = useState<Competition | "todas">("todas");

  function search() {
    if (!seed.trim()) { toast.error("Ingresá un keyword inicial"); return; }
    setIsSearching(true);
    setTimeout(() => {
      setKeywords(generateKeywords(seed.trim()));
      setIsSearching(false);
      setFilter("todas");
      toast.success("12 keywords generados");
    }, 700);
  }

  function copyKeyword(kw: string) {
    void navigator.clipboard.writeText(kw);
    toast.success("Keyword copiado");
  }

  function copyAll() {
    const list = filtered.map((k) => k.keyword).join("\n");
    void navigator.clipboard.writeText(list);
    toast.success(`${filtered.length} keywords copiados`);
  }

  const filtered =
    filter === "todas" ? keywords : keywords.filter((k) => k.competition === filter);

  const lowCount = keywords.filter((k) => k.competition === "baja").length;

  return (
    <div className="space-y-5">
      {/* Input */}
      <div
        className="rounded-xl border p-5 space-y-3"
        style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
      >
        <div className="flex gap-3 flex-col sm:flex-row">
          <input
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="ej: finanzas personales, YouTube sin cara, trading cripto…"
            className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none border"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-default)",
              color: "var(--text-primary)",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent-primary)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
          />
          <Button onClick={search} loading={isSearching} size="md">
            🔍 Buscar
          </Button>
        </div>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Genera 12 variaciones con estimaciones de volumen, competencia y RPM. Basado en patrones reales de YouTube.
        </p>
      </div>

      {/* Resultados */}
      <AnimatePresence>
        {keywords.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* Stat rápida */}
            <div className="flex gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
              <span>
                <span className="font-semibold" style={{ color: "var(--accent-success)" }}>{lowCount}</span> de baja competencia
              </span>
              <span>·</span>
              <span>{keywords.length} keywords totales</span>
            </div>

            {/* Filtros + acción */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex gap-1.5 flex-wrap">
                {(["todas", "baja", "media", "alta"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className="px-3 py-1 rounded-full text-xs font-medium transition-all border"
                    style={{
                      backgroundColor: filter === f ? "var(--accent-primary)" : "var(--bg-secondary)",
                      color: filter === f ? "white" : "var(--text-secondary)",
                      borderColor: filter === f ? "var(--accent-primary)" : "var(--border-default)",
                    }}
                  >
                    {f === "todas"
                      ? "Todas"
                      : `Comp. ${f.charAt(0).toUpperCase() + f.slice(1)}`}
                    {f !== "todas" && (
                      <span className="ml-1 opacity-60">
                        ({keywords.filter((k) => k.competition === f).length})
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <Button variant="secondary" size="sm" onClick={copyAll}>
                📋 Copiar {filtered.length}
              </Button>
            </div>

            {/* Tabla */}
            <Card>
              <CardContent className="pt-0 overflow-x-auto">
                <table className="w-full text-sm min-w-[520px]">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border-default)" }}>
                      <th className="text-left py-3 px-2 font-medium" style={{ color: "var(--text-muted)" }}>
                        Keyword
                      </th>
                      <th className="text-right py-3 px-2 font-medium whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
                        Vol./mes
                      </th>
                      <th className="text-center py-3 px-2 font-medium" style={{ color: "var(--text-muted)" }}>
                        Comp.
                      </th>
                      <th className="text-right py-3 px-2 font-medium" style={{ color: "var(--text-muted)" }}>
                        RPM
                      </th>
                      <th className="text-right py-3 px-2 font-medium" style={{ color: "var(--text-muted)" }}>
                        Score
                      </th>
                      <th className="py-3 px-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((kw, i) => {
                      const cfg = COMP_CONFIG[kw.competition];
                      const scoreColor =
                        kw.score >= 70
                          ? "var(--accent-success)"
                          : kw.score >= 45
                          ? "var(--accent-warning)"
                          : "var(--accent-danger)";
                      return (
                        <motion.tr
                          key={kw.keyword}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          style={{ borderBottom: "1px solid var(--border-default)" }}
                        >
                          <td
                            className="py-2.5 px-2"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {kw.keyword}
                          </td>
                          <td
                            className="py-2.5 px-2 text-right tabular-nums"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {kw.volume}
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <span
                              className="px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{ backgroundColor: cfg.bg, color: cfg.color }}
                            >
                              {cfg.label}
                            </span>
                          </td>
                          <td
                            className="py-2.5 px-2 text-right tabular-nums font-medium"
                            style={{ color: "var(--accent-success)" }}
                          >
                            {kw.rpm}
                          </td>
                          <td className="py-2.5 px-2 text-right">
                            <span
                              className="text-xs font-bold tabular-nums"
                              style={{ color: scoreColor }}
                            >
                              {kw.score}
                            </span>
                          </td>
                          <td className="py-2.5 px-2">
                            <button
                              onClick={() => copyKeyword(kw.keyword)}
                              className="text-xs hover:underline whitespace-nowrap"
                              style={{ color: "var(--accent-primary)" }}
                            >
                              Copiar
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>

                {filtered.length === 0 && (
                  <p className="py-6 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                    No hay keywords con competencia {filter}.
                  </p>
                )}
              </CardContent>
            </Card>

            <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
              Score = volumen + competencia baja + RPM alto. Mayor score → mejor oportunidad de ranking.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
