"use client";

import { useState, useEffect, useCallback } from "react";
import { useUserStore } from "@/store/useUserStore";

interface RoadmapTask {
  id: string;
  phase: number;
  step: number;
  description: string;
  completedAt: string | null;
}

interface PhaseConfig {
  phase: number;
  title: string;
  subtitle: string;
  days: string;
  color: string;
  emoji: string;
}

const PHASE_CONFIG: PhaseConfig[] = [
  { phase: 0, title: "Validación",           subtitle: "Confirmar que el nicho tiene demanda real",              days: "Días 1-3",   color: "var(--accent-primary)",   emoji: "🔍" },
  { phase: 1, title: "Setup & Primeros Videos", subtitle: "Crear el canal y publicar los primeros 3 videos",    days: "Días 4-14",  color: "var(--accent-secondary)", emoji: "🚀" },
  { phase: 2, title: "Consistencia y Crecimiento", subtitle: "2-3 videos por semana y optimización continua",   days: "Días 15-60", color: "var(--accent-success)",   emoji: "📈" },
  { phase: 3, title: "Monetización",          subtitle: "YPP + múltiples fuentes de ingresos",                  days: "Días 61-90+",color: "var(--accent-warning)",   emoji: "💰" },
];

const TOOL_TIPS: Record<number, Record<number, string>> = {
  0: { 1: "NEXUS Evaluador", 2: "viralyt.ai", 3: "YouTube", 4: "NEXUS + YouTube", 5: "Notion" },
  1: { 1: "YouTube Studio", 2: "Canva", 3: "Claude AI + CapCut", 4: "Canva + YT Studio", 5: "YouTube Analytics" },
  2: { 1: "Claude AI + CapCut", 2: "Canva + YT Studio", 3: "YouTube Analytics", 4: "Orgánico", 5: "NEXUS" },
  3: { 1: "Orgánico", 2: "YouTube Studio", 3: "Hotmart / Amazon", 4: "NEXUS + Dubbing IA" },
};

export function RoadmapTimeline() {
  const [tasks, setTasks] = useState<RoadmapTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const { updateMetrics } = useUserStore();

  const loadTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/action-items");
      if (res.ok) {
        const data = await res.json() as { items: RoadmapTask[] };
        setTasks(data.items);
        updateProgress(data.items);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadTasks(); }, [loadTasks]);

  function updateProgress(items: RoadmapTask[]) {
    const completed = items.filter((t) => t.completedAt !== null).length;
    const progress = items.length > 0 ? Math.round((completed / items.length) * 100) : 0;
    updateMetrics({ roadmapProgress: progress });
  }

  async function toggleTask(taskId: string, currentlyCompleted: boolean) {
    const newCompleted = !currentlyCompleted;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, completedAt: newCompleted ? new Date().toISOString() : null }
          : t
      )
    );

    if (newCompleted) {
      const task = tasks.find((t) => t.id === taskId);
      setToast(`✅ ${task?.description.slice(0, 45)}...`);
      setTimeout(() => setToast(null), 3000);
    }

    try {
      const res = await fetch("/api/action-items", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, completed: newCompleted }),
      });
      if (res.ok) {
        const freshRes = await fetch("/api/action-items");
        if (freshRes.ok) {
          const data = await freshRes.json() as { items: RoadmapTask[] };
          setTasks(data.items);
          updateProgress(data.items);
        }
      }
    } catch {
      // Revert on error
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, completedAt: currentlyCompleted ? new Date().toISOString() : null }
            : t
        )
      );
    }
  }

  const totalProgress = tasks.length > 0
    ? Math.round((tasks.filter((t) => t.completedAt !== null).length / tasks.length) * 100)
    : 0;

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-40 rounded-xl" style={{ backgroundColor: "var(--bg-secondary)" }} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-medium"
          style={{ backgroundColor: "var(--accent-success)", color: "white" }}
        >
          {toast}
        </div>
      )}

      {/* Progress */}
      <div className="rounded-xl p-5 border" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Progreso total</span>
          <span className="text-sm font-bold" style={{ color: "var(--accent-primary)" }}>{totalProgress}%</span>
        </div>
        <div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-card)" }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${totalProgress}%`, background: "linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))" }}
          />
        </div>
        <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
          {tasks.filter((t) => t.completedAt !== null).length} de {tasks.length} tareas completadas
        </p>
      </div>

      {/* Phases */}
      <div className="relative">
        <div className="absolute left-5 top-6 bottom-6 w-0.5" style={{ backgroundColor: "var(--border-default)" }} />
        <div className="space-y-6">
          {PHASE_CONFIG.map((cfg) => {
            const phaseTasks = tasks.filter((t) => t.phase === cfg.phase);
            const phaseCompleted = phaseTasks.filter((t) => t.completedAt !== null).length;
            const phasePct = phaseTasks.length > 0 ? Math.round((phaseCompleted / phaseTasks.length) * 100) : 0;
            const isComplete = phaseTasks.length > 0 && phaseCompleted === phaseTasks.length;

            return (
              <div key={cfg.phase} className="relative pl-14">
                {/* Phase dot */}
                <div
                  className="absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center text-lg z-10 border-2 transition-all"
                  style={{
                    backgroundColor: isComplete ? cfg.color : "var(--bg-primary)",
                    borderColor: cfg.color,
                    color: isComplete ? "white" : cfg.color,
                  }}
                >
                  {isComplete ? "✓" : cfg.emoji}
                </div>

                <div
                  className="rounded-xl border overflow-hidden"
                  style={{
                    borderColor: isComplete ? `${cfg.color}60` : "var(--border-default)",
                    backgroundColor: "var(--bg-secondary)",
                  }}
                >
                  {/* Header */}
                  <div
                    className="px-5 py-4 border-b flex items-start justify-between gap-4"
                    style={{ borderColor: "var(--border-default)", backgroundColor: `${cfg.color}08` }}
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm" style={{ color: cfg.color }}>
                          FASE {cfg.phase} — {cfg.title}
                        </h3>
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${cfg.color}20`, color: cfg.color }}>
                          {cfg.days}
                        </span>
                      </div>
                      <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{cfg.subtitle}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-bold" style={{ color: cfg.color }}>{phasePct}%</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{phaseCompleted}/{phaseTasks.length}</p>
                    </div>
                  </div>

                  {/* Tasks */}
                  <div className="p-3 space-y-2">
                    {phaseTasks.map((task) => {
                      const completed = task.completedAt !== null;
                      const tool = TOOL_TIPS[task.phase]?.[task.step];
                      return (
                        <button
                          key={task.id}
                          onClick={() => void toggleTask(task.id, completed)}
                          className="w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all hover:opacity-90 active:scale-[0.99]"
                          style={{
                            backgroundColor: completed ? `${cfg.color}10` : "var(--bg-card)",
                            borderColor: completed ? `${cfg.color}30` : "var(--border-default)",
                          }}
                        >
                          <div
                            className="mt-0.5 w-5 h-5 rounded flex-shrink-0 flex items-center justify-center transition-all"
                            style={{
                              backgroundColor: completed ? cfg.color : "transparent",
                              border: `2px solid ${completed ? cfg.color : "var(--text-muted)"}`,
                            }}
                          >
                            {completed && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-sm font-medium"
                              style={{
                                color: completed ? "var(--text-muted)" : "var(--text-primary)",
                                textDecoration: completed ? "line-through" : "none",
                              }}
                            >
                              {task.description}
                            </p>
                            {tool && (
                              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                                🔧 {tool}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}

                    {phaseTasks.length === 0 && (
                      <p className="text-xs text-center py-3" style={{ color: "var(--text-muted)" }}>
                        Las tareas se generan al evaluar tu primer nicho
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
