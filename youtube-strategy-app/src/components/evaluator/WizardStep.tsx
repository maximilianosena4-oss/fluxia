"use client";

import { motion } from "framer-motion";
import { ProgressBar } from "@/components/dashboard/ProgressBar";

interface WizardStepProps {
  step: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const STEP_LABELS = ["Identificación", "Riesgos", "Demanda", "Competencia", "Veredicto"];

const STEP_ICONS = ["🎯", "⚠️", "📊", "⚔️", "🏆"];

export function WizardStep({ step, totalSteps, title, subtitle, children }: WizardStepProps) {
  const progress = Math.round(((step - 1) / (totalSteps - 1)) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Stepper visual */}
      <div className="space-y-4">
        {/* Dots + labels */}
        <div className="relative flex items-center justify-between">
          {/* Línea de fondo */}
          <div
            className="absolute top-4 left-0 right-0 h-0.5 -z-10"
            style={{ backgroundColor: "var(--border-default)" }}
          />
          {/* Línea de progreso animada */}
          <motion.div
            className="absolute top-4 left-0 h-0.5 -z-10"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ background: "linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))" }}
          />

          {STEP_LABELS.map((label, i) => {
            const stepNum = i + 1;
            const isDone    = stepNum < step;
            const isActive  = stepNum === step;
            const isPending = stepNum > step;

            return (
              <div key={label} className="flex flex-col items-center gap-2" style={{ zIndex: 1 }}>
                {/* Dot */}
                <motion.div
                  initial={false}
                  animate={{
                    scale: isActive ? 1.15 : 1,
                    backgroundColor: isDone
                      ? "var(--accent-success)"
                      : isActive
                      ? "var(--accent-primary)"
                      : "var(--bg-card)",
                    borderColor: isDone
                      ? "var(--accent-success)"
                      : isActive
                      ? "var(--accent-primary)"
                      : "var(--border-default)",
                  }}
                  transition={{ duration: 0.25 }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm border-2"
                  style={isPending ? { color: "var(--text-muted)" } : { color: "white" }}
                >
                  {isDone ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isActive ? (
                    <span className="text-xs font-black">{stepNum}</span>
                  ) : (
                    <span className="text-xs opacity-50">{STEP_ICONS[i]}</span>
                  )}
                </motion.div>

                {/* Label — visible desde sm */}
                <span
                  className="text-xs hidden sm:block text-center font-medium"
                  style={{
                    color: isDone
                      ? "var(--accent-success)"
                      : isActive
                      ? "var(--accent-primary)"
                      : "var(--text-muted)",
                    maxWidth: 64,
                    lineHeight: 1.2,
                  }}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Barra de progreso lineal */}
        <ProgressBar
          value={progress}
          showValue={false}
          color="var(--accent-primary)"
          height={3}
          animated
        />
      </div>

      {/* Encabezado del paso con animación de entrada */}
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="space-y-2"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{STEP_ICONS[step - 1]}</span>
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            {title}
          </h2>
        </div>
        {subtitle && (
          <p className="text-base" style={{ color: "var(--text-secondary)" }}>
            {subtitle}
          </p>
        )}
      </motion.div>

      {/* Contenido del paso */}
      <motion.div
        key={`content-${step}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
