import type { Metadata } from "next";
import { ChatInterface } from "@/components/consultant/ChatInterface";

export const metadata: Metadata = { title: "Consultor IA" };

export default function ConsultantPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Consultor IA — NEXUS
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Respuestas concretas y motivadoras en segundos. Basado en los 5 mentores.
        </p>
      </div>
      <ChatInterface />
    </div>
  );
}
