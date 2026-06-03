"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface PageErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
}

export function PageError({ error, reset, title = "Algo salió mal" }: PageErrorProps) {
  useEffect(() => {
    console.error("[PageError]", error.message, error.digest);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6 text-center px-4">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
        style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
      >
        ⚡
      </div>
      <div className="space-y-2 max-w-sm">
        <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
          {title}
        </h2>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {error.message || "Error inesperado. Esto no te define — volvé a intentarlo."}
        </p>
        {error.digest && (
          <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
            Código: {error.digest}
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <Button onClick={reset} size="sm">
          Reintentar
        </Button>
        <Button variant="ghost" size="sm" onClick={() => (window.location.href = "/dashboard")}>
          Ir al inicio
        </Button>
      </div>
    </div>
  );
}
