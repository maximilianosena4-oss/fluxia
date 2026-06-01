"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Dashboard Error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center px-4">
      <div className="text-5xl">⚡</div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
          Algo salió mal
        </h2>
        <p className="text-sm max-w-sm" style={{ color: "var(--text-secondary)" }}>
          {error.message || "Error inesperado. Esto no te define — volvé a intentarlo."}
        </p>
      </div>
      <div className="flex gap-3">
        <Button onClick={reset}>Reintentar</Button>
        <Button variant="ghost" onClick={() => window.location.href = "/dashboard"}>
          Ir al inicio
        </Button>
      </div>
    </div>
  );
}
