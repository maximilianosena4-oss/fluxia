"use client";

import { ProgressBar } from "@/components/dashboard/ProgressBar";

interface WizardStepProps {
  step: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const STEP_LABELS = ["Identificación", "Riesgos", "Demanda", "Competencia", "Veredicto"];

export function WizardStep({
  step,
  totalSteps,
  title,
  subtitle,
  children,
}: WizardStepProps) {
  const progress = Math.round(((step - 1) / (totalSteps - 1)) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Progress header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs" style={{ color: "var(--text-muted)" }}>
          <span>Paso {step} de {totalSteps}</span>
          <span className="font-medium" style={{ color: "var(--accent-primary)" }}>
            {STEP_LABELS[step - 1]}
          </span>
        </div>
        <ProgressBar
          value={progress}
          showValue={false}
          color="var(--accent-primary)"
          height={4}
          animated
        />
        <div className="flex justify-between">
          {STEP_LABELS.map((label, i) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1"
              style={{ width: `${100 / STEP_LABELS.length}%` }}
            >
              <div
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{
                  backgroundColor:
                    i + 1 <= step
                      ? "var(--accent-primary)"
                      : "var(--text-muted)",
                  transform: i + 1 === step ? "scale(1.5)" : "scale(1)",
                }}
              />
              <span
                className="text-xs hidden sm:block text-center"
                style={{
                  color: i + 1 === step ? "var(--accent-primary)" : "var(--text-muted)",
                  fontWeight: i + 1 === step ? 600 : 400,
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Step header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          {title}
        </h2>
        {subtitle && (
          <p className="text-base" style={{ color: "var(--text-secondary)" }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Step content */}
      {children}
    </div>
  );
}
