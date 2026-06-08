import type { Metadata } from "next";
import { VideoScorer } from "@/components/scorer/VideoScorer";

export const metadata: Metadata = { title: "Quality Scorer" };

export default function ScorerPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 space-y-1">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Quality Scorer
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Puntuación 1-100 con breakdown por título, thumbnail, contenido, SEO y fit del nicho.
          Recomendaciones accionables de la IA.
        </p>
      </div>
      <VideoScorer />
    </div>
  );
}
