import type { Metadata } from "next";
import { MonetizationOptimizer } from "@/components/monetization/MonetizationOptimizer";

export const metadata: Metadata = { title: "Monetización" };

export default function MonetizationPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 space-y-1">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Monetización
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          CPM por nicho · Proyección de ingresos AdSense + patrocinios · Milestones de
          crecimiento y desbloqueos.
        </p>
      </div>
      <MonetizationOptimizer />
    </div>
  );
}
