import type { Metadata } from "next";
import { ChannelAnalyzer } from "@/components/analyzer/ChannelAnalyzer";

export const metadata: Metadata = { title: "Analizador de Canal / Video" };

export default function AnalyzerPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 space-y-1">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Analizador de Canal / Video
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Pegá cualquier URL de YouTube y obtené métricas completas, outlier ratio, score de
          calidad con IA y recomendaciones accionables.
        </p>
      </div>
      <ChannelAnalyzer />
    </div>
  );
}
