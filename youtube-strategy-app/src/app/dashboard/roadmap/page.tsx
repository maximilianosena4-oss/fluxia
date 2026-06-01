// /dashboard/roadmap — FASE 5: Plan de Acción interactivo
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Plan de Acción" };

export default function RoadmapPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
        Plan de Acción — Próximamente (FASE 5)
      </h1>
    </main>
  );
}
