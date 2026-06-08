import type { Metadata } from "next";
import { TrendDetector } from "@/components/trends/TrendDetector";

export const metadata: Metadata = { title: "Detección de Tendencias" };

export default function TrendsPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 space-y-1">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Detección de Tendencias
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Trending Now · Rising Topics · Blue Oceans · Ideas con IA. Datos en tiempo real
          de YouTube por región y nicho.
        </p>
      </div>
      <TrendDetector />
    </div>
  );
}
