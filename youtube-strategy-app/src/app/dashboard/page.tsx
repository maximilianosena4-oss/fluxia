// /dashboard — FASE 2: Dashboard principal con métricas y mentor del día
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <main className="p-8">
      <h1
        className="text-2xl font-bold"
        style={{ color: "var(--text-primary)" }}
      >
        Tu canal de YouTube que genera ingresos. Paso a paso, con IA.
      </h1>
      <p
        className="mt-2 text-sm"
        style={{ color: "var(--text-secondary)" }}
      >
        Dashboard completo llega en FASE 2.
      </p>
    </main>
  );
}
