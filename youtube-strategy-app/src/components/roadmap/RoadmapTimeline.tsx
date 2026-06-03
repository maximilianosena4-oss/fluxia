"use client";

import { useActionItems } from "@/hooks/useActionItems";

interface PhaseConfig {
  phase: number;
  title: string;
  subtitle: string;
  days: string;
  color: string;
  emoji: string;
}

const PHASE_CONFIG: PhaseConfig[] = [
  { phase: 0, title: "Validación",              subtitle: "Confirmar que el nicho tiene demanda real",          days: "Días 1-3",   color: "var(--accent-primary)",   emoji: "🔍" },
  { phase: 1, title: "Setup & Primeros Videos", subtitle: "Crear el canal y publicar los primeros 3 videos",    days: "Días 4-14",  color: "var(--accent-secondary)", emoji: "🚀" },
  { phase: 2, title: "Consistencia y Crecimiento", subtitle: "2-3 videos por semana y optimización continua",  days: "Días 15-60", color: "var(--accent-success)",   emoji: "📈" },
  { phase: 3, title: "Monetización",            subtitle: "YPP + múltiples fuentes de ingresos",               days: "Días 61-90+",color: "var(--accent-warning)",   emoji: "💰" },
];

const TOOL_MAP: Record<number, Record<number, string>> = {
  0: { 1: "NEXUS Evaluador", 2: "viralyt.ai", 3: "YouTube", 4: "NEXUS + YouTube", 5: "Notion" },
  1: { 1: "YouTube Studio", 2: "Canva", 3: "Claude AI + CapCut", 4: "Canva + YT Studio", 5: "YouTube Analytics" },
  2: { 1: "Claude AI + CapCut", 2: "Canva + YT Studio", 3: "YouTube Analytics", 4: "Orgánico", 5: "NEXUS" },
  3: { 1: "Orgánico", 2: "YouTube Studio", 3: "Hotmart / Amazon", 4: "NEXUS + Dubbing IA" },
};

const TIME_MAP: Record<number, Record<number, string>> = {
  0: { 1: "10 min", 2: "15 min", 3: "30 min", 4: "45 min", 5: "20 min" },
  1: { 1: "45 min", 2: "60 min", 3: "90 min", 4: "60 min", 5: "30 min" },
  2: { 1: "90 min", 2: "45 min", 3: "20 min", 4: "Orgánico", 5: "30 min" },
  3: { 1: "20 min", 2: "30 min", 3: "60 min", 4: "45 min" },
};

export function RoadmapTimeline() {
  const { items, isLoading, progress, toggleTask } = useActionItems();

  if (isLoading) {
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
      {/* Progress */}
      <div className="rounded-xl p-5 border" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Progreso total</span>
          <span className="text-sm font-bold" style={{ color: "var(--accent-primary)" }}>{progress}%</span>
        </div>
        <div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-card)" }}>
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%`, background: "linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))" }}
          />
        </div>
        <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
          {items.filter((t) => t.completedAt !== null).length} de {items.length} tareas completadas
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-5 top-6 bottom-6 w-0.5" style={{ backgroundColor: "var(--border-default)" }} />
        <div className="space-y-6">
          {PHASE_CONFIG.map((cfg) => {
            const phaseTasks = items.filter((t) => t.phase === cfg.phase);
            const phaseCompleted = phaseTasks.filter((t) => t.completedAt !== null).length;
            const phasePct = phaseTasks.length > 0 ? Math.round((phaseCompleted / phaseTasks.length) * 100) : 0;
            const isComplete = phaseTasks.length > 0 && phaseCompleted === phaseTasks.length;

            return (
              <div key={cfg.phase} className="relative pl-14">
                {/* Dot de fase */}
                <div
                  className="absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center text-lg z-10 border-2 transition-all duration-300"
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

                  {/* Tareas */}
                  <div className="p-3 space-y-2">
                    {phaseTasks.length === 0 && (
                      <p className="text-xs text-center py-4" style={{ color: "var(--text-muted)" }}>
                        Las tareas aparecen al evaluar tu primer nicho
                      </p>
                    )}
                    {phaseTasks.map((task) => {
                      const completed = task.completedAt !== null;
                      const tool = TOOL_MAP[task.phase]?.[task.step];
                      return (
                        <button
                          key={task.id}
                          onClick={() => toggleTask(task.id, completed)}
                          aria-label={`${completed ? "Desmarcar" : "Completar"}: ${task.description}`}
                          aria-pressed={completed}
                          className="w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all hover:opacity-90 active:scale-[0.99]"
                          style={{
                            backgroundColor: completed ? `${cfg.color}10` : "var(--bg-card)",
                            borderColor: completed ? `${cfg.color}30` : "var(--border-default)",
                          }}
                        >
                          <div
                            className="mt-0.5 w-5 h-5 rounded flex-shrink-0 flex items-center justify-center transition-all duration-200"
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
                              className="text-sm font-medium leading-snug"
                              style={{
                                color: completed ? "var(--text-muted)" : "var(--text-primary)",
                                textDecoration: completed ? "line-through" : "none",
                              }}
                            >
                              {task.description}
                            </p>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                              {tool && (
                                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                                  🔧 {tool}
                                </span>
                              )}
                              {TIME_MAP[task.phase]?.[task.step] && (
                                <span className="text-xs" style={{ color: "var(--accent-warning)" }}>
                                  ⏱ {TIME_MAP[task.phase][task.step]}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
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
