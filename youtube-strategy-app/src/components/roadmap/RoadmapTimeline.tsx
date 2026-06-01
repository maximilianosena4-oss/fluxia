"use client";

import { useState } from "react";
import { useUserStore } from "@/store/useUserStore";

interface RoadmapTask {
  id: string;
  description: string;
  estimatedTime: string;
  tool: string;
  completed: boolean;
}

interface RoadmapPhase {
  phase: number;
  title: string;
  subtitle: string;
  days: string;
  color: string;
  emoji: string;
  tasks: RoadmapTask[];
}

const INITIAL_PHASES: RoadmapPhase[] = [
  {
    phase: 0,
    title: "Validación",
    subtitle: "Confirmar que el nicho tiene demanda real antes de invertir tiempo",
    days: "Días 1-3",
    color: "var(--accent-primary)",
    emoji: "🔍",
    tasks: [
      { id: "p0t1", description: "Completar evaluación de nicho en NEXUS Evaluador", estimatedTime: "10 min", tool: "NEXUS Evaluador", completed: false },
      { id: "p0t2", description: "Validar en viralyt.ai (confirmar outliers reales)", estimatedTime: "15 min", tool: "viralyt.ai", completed: false },
      { id: "p0t3", description: "Identificar 10 mejores canales de referencia", estimatedTime: "20 min", tool: "YouTube", completed: false },
      { id: "p0t4", description: "Aplicar Outlier Test a los 3 canales top", estimatedTime: "15 min", tool: "NEXUS + YouTube", completed: false },
      { id: "p0t5", description: "Diseñar la oferta backend ANTES de crear el canal (Hormozi)", estimatedTime: "30 min", tool: "Notion", completed: false },
    ],
  },
  {
    phase: 1,
    title: "Setup & Primeros Videos",
    subtitle: "Crear el canal y publicar los primeros 3 videos validando el packaging",
    days: "Días 4-14",
    color: "var(--accent-secondary)",
    emoji: "🚀",
    tasks: [
      { id: "p1t1", description: "Crear canal de YouTube con configuración completa", estimatedTime: "45 min", tool: "YouTube Studio", completed: false },
      { id: "p1t2", description: "Diseñar banner y logo con identidad del nicho", estimatedTime: "1h", tool: "Canva / Adobe Express", completed: false },
      { id: "p1t3", description: "Publicar Video 1 (guión viral aplicando Hormozi)", estimatedTime: "3h", tool: "Claude AI + CapCut", completed: false },
      { id: "p1t4", description: "Publicar Video 2 (A/B test de thumbnail)", estimatedTime: "3h", tool: "Claude AI + Canva", completed: false },
      { id: "p1t5", description: "Publicar Video 3 (medir CTR y retención — ajustar)", estimatedTime: "3h", tool: "YouTube Analytics", completed: false },
    ],
  },
  {
    phase: 2,
    title: "Consistencia y Crecimiento",
    subtitle: "Publicar 2-3 videos por semana y optimizar basándote en datos reales",
    days: "Días 15-60",
    color: "var(--accent-success)",
    emoji: "📈",
    tasks: [
      { id: "p2t1", description: "Publicar 2-3 videos por semana consistentemente", estimatedTime: "6-9h/sem", tool: "Claude AI + CapCut", completed: false },
      { id: "p2t2", description: "Optimizar thumbnails con CTR < 3% (cambiar en 48h)", estimatedTime: "30 min/video", tool: "Canva + YT Studio", completed: false },
      { id: "p2t3", description: "Replicar formato del video con mejor retención", estimatedTime: "2h", tool: "YouTube Analytics", completed: false },
      { id: "p2t4", description: "Llegar a 500 suscriptores (punto de inflexión del algoritmo)", estimatedTime: "Variable", tool: "Orgánico", completed: false },
      { id: "p2t5", description: "Revisar métricas semanales con NEXUS Consultor IA", estimatedTime: "15 min/sem", tool: "NEXUS", completed: false },
    ],
  },
  {
    phase: 3,
    title: "Monetización",
    subtitle: "Alcanzar los requisitos del YPP y activar múltiples fuentes de ingresos",
    days: "Días 61-90+",
    color: "var(--accent-warning)",
    emoji: "💰",
    tasks: [
      { id: "p3t1", description: "Alcanzar 1.000 subs + 4.000h de visualización", estimatedTime: "Variable", tool: "Orgánico", completed: false },
      { id: "p3t2", description: "Aplicar al Programa de Socios de YouTube", estimatedTime: "30 min", tool: "YouTube Studio", completed: false },
      { id: "p3t3", description: "Activar primera fuente alternativa (afiliados o producto)", estimatedTime: "2h", tool: "Hotmart / Amazon Associates", completed: false },
      { id: "p3t4", description: "Expandir al segundo nicho o al inglés (modelo multi-canal)", estimatedTime: "Variable", tool: "NEXUS + Dubbing IA", completed: false },
    ],
  },
];

function calculateProgress(phases: RoadmapPhase[]): number {
  const allTasks = phases.flatMap((p) => p.tasks);
  const completed = allTasks.filter((t) => t.completed).length;
  return allTasks.length > 0 ? Math.round((completed / allTasks.length) * 100) : 0;
}

export function RoadmapTimeline() {
  const [phases, setPhases] = useState<RoadmapPhase[]>(INITIAL_PHASES);
  const [toast, setToast] = useState<string | null>(null);
  const { updateMetrics } = useUserStore();

  function toggleTask(phaseIdx: number, taskId: string) {
    setPhases((prev) => {
      const next = prev.map((phase, i) => {
        if (i !== phaseIdx) return phase;
        return {
          ...phase,
          tasks: phase.tasks.map((t) =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
          ),
        };
      });

      const progress = calculateProgress(next);
      updateMetrics({ roadmapProgress: progress });

      const task = next[phaseIdx]?.tasks.find((t) => t.id === taskId);
      if (task?.completed) {
        setToast(`✅ ${task.description.slice(0, 40)}... completada!`);
        setTimeout(() => setToast(null), 3000);
      }

      return next;
    });
  }

  const totalProgress = calculateProgress(phases);

  return (
    <div className="space-y-6">
      {/* Toast motivacional */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all"
          style={{
            backgroundColor: "var(--accent-success)",
            color: "white",
          }}
        >
          {toast}
        </div>
      )}

      {/* Progress header */}
      <div
        className="rounded-xl p-5 border"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border-default)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            Progreso total
          </span>
          <span className="text-sm font-bold" style={{ color: "var(--accent-primary)" }}>
            {totalProgress}%
          </span>
        </div>
        <div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-card)" }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${totalProgress}%`,
              background: "linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))",
            }}
          />
        </div>
        <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
          {phases.flatMap((p) => p.tasks).filter((t) => t.completed).length} de {phases.flatMap((p) => p.tasks).length} tareas completadas
        </p>
      </div>

      {/* Fases */}
      <div className="relative">
        {/* Línea vertical de conexión */}
        <div
          className="absolute left-5 top-6 bottom-6 w-0.5"
          style={{ backgroundColor: "var(--border-default)" }}
        />

        <div className="space-y-6">
          {phases.map((phase, phaseIdx) => {
            const phaseTasks = phase.tasks;
            const phaseCompleted = phaseTasks.filter((t) => t.completed).length;
            const phaseProgress = Math.round((phaseCompleted / phaseTasks.length) * 100);
            const isComplete = phaseCompleted === phaseTasks.length;

            return (
              <div key={phase.phase} className="relative pl-14">
                {/* Phase dot */}
                <div
                  className="absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold z-10 border-2"
                  style={{
                    backgroundColor: isComplete ? phase.color : "var(--bg-primary)",
                    borderColor: phase.color,
                    color: isComplete ? "white" : phase.color,
                  }}
                >
                  {isComplete ? "✓" : phase.emoji}
                </div>

                {/* Phase card */}
                <div
                  className="rounded-xl border overflow-hidden"
                  style={{
                    borderColor: isComplete ? `${phase.color}60` : "var(--border-default)",
                    backgroundColor: "var(--bg-secondary)",
                  }}
                >
                  {/* Phase header */}
                  <div
                    className="px-5 py-4 border-b flex items-start justify-between gap-4"
                    style={{
                      borderColor: "var(--border-default)",
                      backgroundColor: `${phase.color}08`,
                    }}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold" style={{ color: phase.color }}>
                          FASE {phase.phase} — {phase.title}
                        </h3>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${phase.color}20`,
                            color: phase.color,
                          }}
                        >
                          {phase.days}
                        </span>
                      </div>
                      <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                        {phase.subtitle}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-bold" style={{ color: phase.color }}>
                        {phaseProgress}%
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {phaseCompleted}/{phaseTasks.length}
                      </p>
                    </div>
                  </div>

                  {/* Tasks */}
                  <div className="p-3 space-y-2">
                    {phaseTasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => toggleTask(phaseIdx, task.id)}
                        className="w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all hover:opacity-90"
                        style={{
                          backgroundColor: task.completed ? `${phase.color}10` : "var(--bg-card)",
                          borderColor: task.completed ? `${phase.color}30` : "var(--border-default)",
                        }}
                      >
                        {/* Checkbox */}
                        <div
                          className="mt-0.5 w-5 h-5 rounded flex-shrink-0 flex items-center justify-center transition-all"
                          style={{
                            backgroundColor: task.completed ? phase.color : "transparent",
                            border: `2px solid ${task.completed ? phase.color : "var(--text-muted)"}`,
                          }}
                        >
                          {task.completed && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>

                        {/* Task content */}
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-medium"
                            style={{
                              color: task.completed ? "var(--text-muted)" : "var(--text-primary)",
                              textDecoration: task.completed ? "line-through" : "none",
                            }}
                          >
                            {task.description}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                            <span>⏱ {task.estimatedTime}</span>
                            <span>🔧 {task.tool}</span>
                          </div>
                        </div>
                      </button>
                    ))}
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
