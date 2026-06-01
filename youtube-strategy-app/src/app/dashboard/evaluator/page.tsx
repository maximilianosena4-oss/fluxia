import type { Metadata } from "next";
import { NicheEvaluatorWizard } from "@/components/evaluator/NicheEvaluatorWizard";

export const metadata: Metadata = { title: "Evaluador de Nichos" };

export default function EvaluatorPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 space-y-1">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Evaluador de Nichos
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          10 minutos. Scoring automático con YouTube API. Resultado inmediato.
        </p>
      </div>
      <NicheEvaluatorWizard />
    </div>
  );
}
