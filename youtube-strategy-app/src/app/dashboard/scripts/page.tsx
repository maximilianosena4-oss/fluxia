import type { Metadata } from "next";
import { ScriptGenerator } from "@/components/scripts/ScriptGenerator";

export const metadata: Metadata = { title: "Generador de Guiones" };

export default function ScriptsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 space-y-1">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Generador de Guiones
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Estructura profesional basada en Adrián Sáenz + MrBeast. Cada guión listo para grabar.
        </p>
      </div>
      <ScriptGenerator />
    </div>
  );
}
