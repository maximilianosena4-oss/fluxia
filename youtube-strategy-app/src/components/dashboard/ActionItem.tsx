"use client";

import { useState } from "react";

interface ActionItemProps {
  id: string;
  description: string;
  phase: number;
  estimatedTime?: string;
  tool?: string;
  completed?: boolean;
  onToggle?: (id: string, completed: boolean) => void;
}

const PHASE_COLORS = [
  "var(--accent-primary)",   // Fase 0 — Validación
  "var(--accent-secondary)", // Fase 1 — Setup
  "var(--accent-success)",   // Fase 2 — Crecimiento
  "var(--accent-warning)",   // Fase 3 — Monetización
];

export function ActionItem({
  id,
  description,
  phase,
  estimatedTime,
  tool,
  completed: initialCompleted = false,
  onToggle,
}: ActionItemProps) {
  const [completed, setCompleted] = useState(initialCompleted);
  const color = PHASE_COLORS[phase] ?? PHASE_COLORS[0];

  function handleToggle() {
    const next = !completed;
    setCompleted(next);
    onToggle?.(id, next);
  }

  return (
    <div
      className="flex items-start gap-3 p-3 rounded-lg transition-all duration-200 group"
      style={{
        backgroundColor: completed ? `${color}10` : "transparent",
        border: `1px solid ${completed ? `${color}30` : "var(--border-default)"}`,
      }}
    >
      {/* Checkbox */}
      <button
        onClick={handleToggle}
        className="mt-0.5 flex-shrink-0 w-5 h-5 rounded flex items-center justify-center transition-all duration-200 focus:outline-none focus-visible:ring-2"
        style={{
          backgroundColor: completed ? color : "transparent",
          border: `2px solid ${completed ? color : "var(--text-muted)"}`,
        }}
        aria-label={completed ? "Marcar como pendiente" : "Marcar como completada"}
      >
        {completed && (
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <p
          className="text-sm font-medium leading-snug transition-all duration-200"
          style={{
            color: completed ? "var(--text-muted)" : "var(--text-primary)",
            textDecoration: completed ? "line-through" : "none",
          }}
        >
          {description}
        </p>

        {(estimatedTime || tool) && (
          <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
            {estimatedTime && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                {estimatedTime}
              </span>
            )}
            {tool && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
                </svg>
                {tool}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Phase dot */}
      <div
        className="flex-shrink-0 w-2 h-2 rounded-full mt-1.5"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}
