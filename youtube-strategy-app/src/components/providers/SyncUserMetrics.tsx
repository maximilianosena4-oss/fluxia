"use client";

import { useEffect } from "react";
import { useUserStore } from "@/store/useUserStore";
import type { DashboardMetrics } from "@/types";

export interface SyncUserMetricsProps {
  metrics: Partial<DashboardMetrics>;
}

// Sincroniza los datos del servidor (nicheScore, roadmapProgress, etc.)
// con el store Zustand que usa el ChatInterface para contextualizar las respuestas IA.
export function SyncUserMetrics({ metrics }: SyncUserMetricsProps) {
  const updateMetrics = useUserStore((s) => s.updateMetrics);

  useEffect(() => {
    updateMetrics(metrics);
  // Solo sincronizar al montar — los valores vienen del servidor
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
