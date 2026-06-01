import type { Metadata } from "next";
import { RoadmapTimeline } from "@/components/roadmap/RoadmapTimeline";

export const metadata: Metadata = { title: "Plan de Acción" };

export default function RoadmapPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 space-y-1">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Plan de Acción
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Tu roadmap de 0 a monetización. Completá cada tarea para avanzar de fase.
        </p>
      </div>
      <RoadmapTimeline />
    </div>
  );
}
