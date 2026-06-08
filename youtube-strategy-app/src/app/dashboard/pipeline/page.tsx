import type { Metadata } from "next";
import { ContentPipelineWizard } from "@/components/pipeline/ContentPipeline";

export const metadata: Metadata = { title: "Content Pipeline" };

export default function PipelinePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 space-y-1">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Content Pipeline
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Wizard de 7 pasos: Tema → Research → Outline → Guión → Títulos → Thumbnail → SEO.
          Guardado automático en Supabase al completar.
        </p>
      </div>
      <ContentPipelineWizard />
    </div>
  );
}
