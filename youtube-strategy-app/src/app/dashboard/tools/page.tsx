import type { Metadata } from "next";
import { HookGenerator } from "@/components/tools/HookGenerator";
import { PublishChecklist } from "@/components/tools/PublishChecklist";
import { KeywordResearch } from "@/components/tools/KeywordResearch";

export const metadata: Metadata = { title: "Herramientas" };

export default function ToolsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Herramientas
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Keyword research · Generador de hooks · Checklist pre-publicación.
        </p>
      </div>

      <section>
        <h2 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>
          🔍 Keyword Research
        </h2>
        <KeywordResearch />
      </section>

      <section>
        <h2 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>
          ⚡ Generador de Hooks (primeros 30s)
        </h2>
        <HookGenerator />
      </section>

      <section>
        <h2 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>
          ✅ Checklist pre-publicación
        </h2>
        <PublishChecklist />
      </section>
    </div>
  );
}
