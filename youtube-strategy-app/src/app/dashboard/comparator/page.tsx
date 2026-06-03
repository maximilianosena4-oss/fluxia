import type { Metadata } from "next";
import { NicheComparator } from "@/components/evaluator/NicheComparator";

export const metadata: Metadata = { title: "Comparador de Nichos" };

export default function ComparatorPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Comparador de Nichos
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Ingresá 2 o 3 nichos y comparalos lado a lado con el modelo de evaluación NEXUS.
        </p>
      </div>

      <NicheComparator />
    </div>
  );
}
