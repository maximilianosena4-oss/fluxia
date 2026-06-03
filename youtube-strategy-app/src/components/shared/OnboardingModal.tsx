"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Step {
  emoji: string;
  title: string;
  description: string;
  action?: { label: string; href: string };
}

const STEPS: Step[] = [
  {
    emoji: "👋",
    title: "Bienvenido a NEXUS",
    description: "Tu consultor IA de YouTube. 12 secciones para llevarte de cero a monetización en 90 días. Empezá por el Evaluador de Nicho — define el 80% de tu éxito.",
  },
  {
    emoji: "⚡",
    title: "Paso 1: Evaluá tu nicho",
    description: "Wizard de 5 pasos con scoring de 96 puntos. NEXUS busca en YouTube API en tiempo real y valida con los criterios de los 5 mentores. Resultado: GO / REFINE / DISCARD.",
    action: { label: "Evaluar mi nicho →", href: "/dashboard/evaluator" },
  },
  {
    emoji: "⚖️",
    title: "Compará opciones",
    description: "Si dudás entre varios nichos, el Comparador los evalúa lado a lado con el mismo modelo de 96 puntos. Ve qué nicho gana en cada criterio y elegí con datos.",
    action: { label: "Comparar nichos →", href: "/dashboard/comparator" },
  },
  {
    emoji: "🤖",
    title: "Consultá con IA",
    description: "El Consultor recuerda el historial de tu sesión y usa RAG sobre los 5 mentores. Responde en formato estructurado: Análisis · Recomendación · Acción · Fuente.",
    action: { label: "Abrir el consultor →", href: "/dashboard/consultant" },
  },
  {
    emoji: "🛠️",
    title: "Las herramientas",
    description: "En un solo lugar: Keyword Research (volumen + competencia + RPM), Generador de Hooks (5 tipos, principios de MrBeast) y Checklist pre-publicación (21 ítems).",
    action: { label: "Ver herramientas →", href: "/dashboard/tools" },
  },
  {
    emoji: "🚀",
    title: "¡Todo listo!",
    description: "Tenés 12 secciones, 5 mentores, análisis IA y roadmap personalizado. El atajo más rápido: evaluá el nicho → seguí el roadmap → consultá al IA ante cualquier duda.",
  },
];

const ONBOARDING_KEY = "nexus_onboarding_v1";

export function OnboardingModal() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const done = localStorage.getItem(ONBOARDING_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!done) setVisible(true);
  }, []);

  function next() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      finish();
    }
  }

  function finish() {
    localStorage.setItem(ONBOARDING_KEY, "1");
    setVisible(false);
  }

  const current = STEPS[step];

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
            onClick={finish}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="w-full max-w-md rounded-2xl border shadow-2xl p-8 space-y-6 pointer-events-auto"
              style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-accent)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Step indicators */}
              <div className="flex gap-1.5">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 h-1 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: i <= step ? "var(--accent-primary)" : "var(--bg-card)",
                    }}
                  />
                ))}
              </div>

              {/* Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="text-4xl">{current.emoji}</div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                      {current.title}
                    </h2>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {current.description}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Actions */}
              <div className="flex items-center gap-3">
                {current.action ? (
                  <Button asChild className="flex-1">
                    <Link href={current.action.href} onClick={finish}>
                      {current.action.label}
                    </Link>
                  </Button>
                ) : (
                  <Button onClick={next} className="flex-1">
                    {step === STEPS.length - 1 ? "¡Empezar!" : "Continuar →"}
                  </Button>
                )}
                {current.action && (
                  <Button variant="ghost" size="sm" onClick={next} style={{ color: "var(--text-muted)" }}>
                    Siguiente
                  </Button>
                )}
              </div>

              <button
                onClick={finish}
                className="block w-full text-xs text-center"
                style={{ color: "var(--text-muted)" }}
              >
                Saltar introducción
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
