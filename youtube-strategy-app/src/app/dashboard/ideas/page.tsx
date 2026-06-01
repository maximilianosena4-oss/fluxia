import type { Metadata } from "next";
import { ContentFactory } from "@/components/ideas/ContentFactory";

export const metadata: Metadata = { title: "Content Factory" };

export default function IdeasPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 space-y-1">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Content Factory
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Generador de ideas con Outlier Test (MrBeast) + YouTube API en tiempo real.
          Nunca te quedés sin contenido.
        </p>
      </div>
      <ContentFactory />
    </div>
  );
}
