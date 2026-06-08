import type { Metadata } from "next";
import { TitleGenerator } from "@/components/titles/TitleGenerator";

export const metadata: Metadata = { title: "Generador de Títulos" };

export default function TitlesPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 space-y-1">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Generador de Títulos
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          10 títulos optimizados para CTR con score, tags y sugerencias de mejora. Referencia
          en videos reales de YouTube.
        </p>
      </div>
      <TitleGenerator />
    </div>
  );
}
