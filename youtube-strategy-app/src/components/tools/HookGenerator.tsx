"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Hook {
  id: string;
  text: string;
  type: HookType;
  principle: string;
  rating: number | null;
}

type HookType = "shock" | "promise" | "question" | "story" | "controversy";

const HOOK_TYPES: Array<{ value: HookType; label: string; emoji: string; template: string; principle: string }> = [
  {
    value: "shock",
    label: "Shock/Sorpresa",
    emoji: "😱",
    template: "El {X}% de las personas que intentan {TEMA} lo hacen MAL. Y no lo saben.",
    principle: "MrBeast: los primeros 3 segundos deben ser imposibles de ignorar",
  },
  {
    value: "promise",
    label: "Promesa concreta",
    emoji: "🎯",
    template: "En los próximos {TIEMPO}, voy a mostrarte exactamente cómo {RESULTADO} — sin {OBSTÁCULO}.",
    principle: "Adrián Sáenz: la promesa debe ser específica y creíble",
  },
  {
    value: "question",
    label: "Pregunta incómoda",
    emoji: "🤔",
    template: "¿Por qué {PERSONA/CANAL} gana ${CANTIDAD} con {TEMA} y vos todavía no podés?",
    principle: "El espectador se identifica con la situación y quiere la respuesta",
  },
  {
    value: "story",
    label: "Historia personal",
    emoji: "📖",
    template: "Hace {TIEMPO}, yo {SITUACIÓN NEGATIVA}. Hoy {SITUACIÓN POSITIVA}. Esto es lo que cambió.",
    principle: "Eloisa Wolf: la narrativa personal genera confianza y retención",
  },
  {
    value: "controversy",
    label: "Controversia",
    emoji: "🔥",
    template: "{AFIRMACIÓN POLÉMICA PERO VERDADERA}. Sé que esto va a incomodar a muchos, pero necesitan escuchar esto.",
    principle: "MrBeast: la controversia bien usada dispara el engagement orgánico",
  },
];

function generateHooks(topic: string, niche: string): Hook[] {
  return HOOK_TYPES.map((ht, i) => {
    let text = ht.template
      .replace("{TEMA}", topic)
      .replace("{X}", ["73", "89", "67", "91", "82"][i])
      .replace("{TIEMPO}", ["5 minutos", "este video", "30 días", "la próxima semana"][i % 4])
      .replace("{RESULTADO}", `ganar dinero con ${niche}`)
      .replace("{OBSTÁCULO}", "experiencia previa ni inversión inicial")
      .replace("{PERSONA/CANAL}", "ese canal pequeño")
      .replace("{CANTIDAD}", ["500", "1.000", "2.500", "10.000"][i % 4])
      .replace("{SITUACIÓN NEGATIVA}", `no sabía nada de ${niche}`)
      .replace("{SITUACIÓN POSITIVA}", `vivo de eso`)
      .replace("{AFIRMACIÓN POLÉMICA PERO VERDADERA}", `La mayoría de los consejos sobre ${niche} que encontrás online están equivocados`);

    // Si hay topic específico, personalizar más
    if (topic && topic !== niche) {
      text = text.replace(new RegExp(niche, "g"), topic);
    }

    return {
      id: `hook-${i}`,
      text,
      type: ht.value,
      principle: ht.principle,
      rating: null,
    };
  });
}

export function HookGenerator() {
  const [topic, setTopic] = useState("");
  const [niche, setNiche] = useState("");
  const [hooks, setHooks] = useState<Hook[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  function generate() {
    if (!topic.trim()) { toast.error("Escribí el tema del video"); return; }
    setIsGenerating(true);
    setTimeout(() => {
      setHooks(generateHooks(topic.trim(), niche.trim() || topic.trim()));
      setIsGenerating(false);
      toast.success("5 hooks generados");
    }, 600);
  }

  function rateHook(id: string, rating: number) {
    setHooks((prev) => prev.map((h) => h.id === id ? { ...h, rating } : h));
  }

  function copyHook(text: string) {
    void navigator.clipboard.writeText(text);
    toast.success("Hook copiado al portapapeles");
  }

  const sortedHooks = [...hooks].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

  return (
    <div className="space-y-5">
      <div
        className="rounded-xl border p-5 space-y-4"
        style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
      >
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Tema del video *
            </label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generate()}
              placeholder="ej: cómo monetizar en YouTube sin cara"
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border"
              style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent-primary)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Nicho (opcional)
            </label>
            <input
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="ej: finanzas personales"
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border"
              style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent-primary)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
            />
          </div>
        </div>
        <Button onClick={generate} loading={isGenerating} size="md">
          ⚡ Generar 5 hooks
        </Button>
      </div>

      <AnimatePresence>
        {sortedHooks.length > 0 && (
          <div className="space-y-3">
            {sortedHooks.map((hook, i) => {
              const typeInfo = HOOK_TYPES.find((t) => t.value === hook.type)!;
              return (
                <motion.div
                  key={hook.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Card style={{ borderColor: hook.rating === 5 ? "var(--border-accent)" : "var(--border-default)" }}>
                    <CardContent className="pt-0 space-y-3">
                      <div className="flex items-center justify-between pt-5">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{typeInfo.emoji}</span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: "var(--bg-card)", color: "var(--text-secondary)" }}>
                            {typeInfo.label}
                          </span>
                        </div>
                        {/* Rating */}
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} onClick={() => rateHook(hook.id, star)}
                              className="text-sm transition-transform hover:scale-125"
                              style={{ color: (hook.rating ?? 0) >= star ? "var(--accent-warning)" : "var(--text-muted)" }}>
                              ★
                            </button>
                          ))}
                        </div>
                      </div>

                      <blockquote
                        className="text-sm font-medium leading-relaxed"
                        style={{ color: "var(--text-primary)" }}
                      >
                        &ldquo;{hook.text}&rdquo;
                      </blockquote>

                      <p className="text-xs italic" style={{ color: "var(--text-muted)" }}>
                        {hook.principle}
                      </p>

                      <Button variant="secondary" size="sm" onClick={() => copyHook(hook.text)}>
                        📋 Copiar hook
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            {sortedHooks.some((h) => h.rating !== null) && (
              <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
                ⭐ Los hooks mejor calificados aparecen primero
              </p>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
