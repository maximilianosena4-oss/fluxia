"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface Idea {
  id: string;
  title: string;
  status: string;
  outlierScore: number | null;
  createdAt: string;
  updatedAt: string;
}

const DAYS_ES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

// Mejores horarios para publicar (según brief: mar-jue 14-18h)
const OPTIMAL_DAYS = [1, 2, 3]; // Lun=0, Mar=1, Mié=2, Jue=3...

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

export function ContentCalendar({ ideas }: { ideas: Idea[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scheduledIdeas, setScheduledIdeas] = useState<Record<string, string>>(() => {
    // Inicializar con fechas sugeridas automáticamente (mar/mié/jue en semanas siguientes)
    const auto: Record<string, string> = {};
    const pending = ideas.filter((i) => i.status === "pending" || i.status === "in-progress");
    let weekOffset = 0;
    let dayInWeek = 0;
    const optDays = [1, 3, 5]; // Martes, Jueves, Sábado (índices de semana)

    pending.forEach((idea) => {
      if (dayInWeek >= optDays.length) { dayInWeek = 0; weekOffset++; }
      const d = new Date();
      d.setDate(d.getDate() + weekOffset * 7 + optDays[dayInWeek] + 1);
      auto[idea.id] = d.toISOString().split("T")[0];
      dayInWeek++;
    });

    return auto;
  });

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const monday = useMemo(() => getMonday(currentDate), [currentDate]);

  const weekDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    }), [monday]);

  function getIdeasForDay(day: Date): Idea[] {
    const dateStr = day.toISOString().split("T")[0];
    return ideas.filter((idea) => scheduledIdeas[idea.id] === dateStr);
  }

  function unscheduledIdeas(): Idea[] {
    return ideas.filter((idea) => !scheduledIdeas[idea.id] && idea.status !== "published");
  }

  function handleDrop(day: Date) {
    if (!draggedId) return;
    const dateStr = day.toISOString().split("T")[0];
    setScheduledIdeas((prev) => ({ ...prev, [draggedId]: dateStr }));
    setDraggedId(null);
    toast.success("Idea programada para el " + day.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" }));
  }

  function removeFromDay(ideaId: string) {
    setScheduledIdeas((prev) => {
      const next = { ...prev };
      delete next[ideaId];
      return next;
    });
  }

  const today = new Date();

  const statusColors: Record<string, string> = {
    pending: "var(--accent-primary)",
    "in-progress": "var(--accent-warning)",
    published: "var(--accent-success)",
    archived: "var(--text-muted)",
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => {
            const d = new Date(currentDate);
            d.setDate(d.getDate() - 7);
            setCurrentDate(d);
          }}>←</Button>
          <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
            {monday.toLocaleDateString("es-AR", { day: "numeric", month: "long" })} —{" "}
            {weekDays[6].toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}
          </span>
          <Button variant="ghost" size="sm" onClick={() => {
            const d = new Date(currentDate);
            d.setDate(d.getDate() + 7);
            setCurrentDate(d);
          }}>→</Button>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setCurrentDate(new Date())}>
          Hoy
        </Button>
      </div>

      <div className="grid lg:grid-cols-4 gap-4">
        {/* Calendario semanal */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-7 gap-1.5">
            {DAYS_ES.map((day, i) => (
              <div key={day} className="text-center text-xs font-semibold py-1.5" style={{ color: OPTIMAL_DAYS.includes(i) ? "var(--accent-primary)" : "var(--text-muted)" }}>
                {day}
                {OPTIMAL_DAYS.includes(i) && <span className="ml-1 text-xs">★</span>}
              </div>
            ))}

            {weekDays.map((day, i) => {
              const dayIdeas = getIdeasForDay(day);
              const isToday = isSameDay(day, today);
              const isPast = day < today && !isToday;
              const isOptimal = OPTIMAL_DAYS.includes(i);

              return (
                <div
                  key={i}
                  className="rounded-xl border min-h-[100px] p-2 transition-all"
                  style={{
                    backgroundColor: isToday ? "var(--accent-primary)10" : "var(--bg-secondary)",
                    borderColor: isToday ? "var(--accent-primary)" : draggedId && !isPast ? "var(--border-accent)" : "var(--border-default)",
                    opacity: isPast ? 0.5 : 1,
                  }}
                  onDragOver={(e) => { if (!isPast) e.preventDefault(); }}
                  onDrop={() => { if (!isPast) handleDrop(day); }}
                  onClick={() => !isPast && setSelectedDay(selectedDay && isSameDay(selectedDay, day) ? null : day)}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className="text-xs font-bold"
                      style={{ color: isToday ? "var(--accent-primary)" : "var(--text-secondary)" }}
                    >
                      {day.getDate()}
                    </span>
                    {isOptimal && !isPast && (
                      <span className="text-xs" style={{ color: "var(--accent-primary)" }} title="Día óptimo para publicar">⭐</span>
                    )}
                  </div>

                  <div className="space-y-1">
                    {dayIdeas.map((idea) => (
                      <motion.div
                        key={idea.id}
                        layout
                        draggable
                        onDragStart={() => setDraggedId(idea.id)}
                        className="group relative rounded px-2 py-1 cursor-grab active:cursor-grabbing"
                        style={{
                          backgroundColor: `${statusColors[idea.status] ?? "var(--accent-primary)"}25`,
                          borderLeft: `2px solid ${statusColors[idea.status] ?? "var(--accent-primary)"}`,
                        }}
                        title={idea.title}
                      >
                        <p className="text-xs truncate leading-tight" style={{ color: "var(--text-primary)" }}>
                          {idea.title}
                        </p>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeFromDay(idea.id); }}
                          className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          ×
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex items-center gap-4 text-xs" style={{ color: "var(--text-muted)" }}>
            <span>⭐ Días óptimos: Martes, Miércoles, Jueves (14-18hs)</span>
            <span>· Arrastrá ideas al día deseado · Hacé click para ver detalles</span>
          </div>

          {/* Panel de día seleccionado */}
          {selectedDay && (
            <div
              className="mt-3 rounded-xl border p-4 space-y-2"
              style={{ backgroundColor: "rgba(99,102,241,0.08)", borderColor: "rgba(99,102,241,0.25)" }}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold" style={{ color: "var(--accent-primary)" }}>
                  {selectedDay.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
                </p>
                <button onClick={() => setSelectedDay(null)} style={{ color: "var(--text-muted)" }} className="text-xs">✕</button>
              </div>
              {getIdeasForDay(selectedDay).length === 0 ? (
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Sin videos programados para este día. Arrastrá una idea desde el panel.</p>
              ) : (
                getIdeasForDay(selectedDay).map((idea) => (
                  <div key={idea.id} className="text-xs flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                    <span style={{ color: statusColors[idea.status] ?? "var(--accent-primary)" }}>●</span>
                    <span>{idea.title}</span>
                    <span className="ml-auto" style={{ color: "var(--text-muted)" }}>
                      {{ pending: "Pendiente", "in-progress": "En progreso", published: "Publicada", archived: "Archivada" }[idea.status] ?? idea.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Panel de ideas sin programar */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
            Ideas para programar ({unscheduledIdeas().length})
          </h3>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {unscheduledIdeas().length === 0 ? (
              <p className="text-xs text-center py-6" style={{ color: "var(--text-muted)" }}>
                Todas las ideas están programadas 🎉
              </p>
            ) : (
              unscheduledIdeas().map((idea) => (
                <div
                  key={idea.id}
                  draggable
                  onDragStart={() => setDraggedId(idea.id)}
                  className="p-3 rounded-xl border cursor-grab active:cursor-grabbing"
                  style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
                >
                  <p className="text-xs font-medium leading-snug" style={{ color: "var(--text-primary)" }}>
                    {idea.title}
                  </p>
                  {idea.outlierScore && (
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-full h-1 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-card)" }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${idea.outlierScore}%`, backgroundColor: "var(--accent-primary)" }}
                        />
                      </div>
                      <span className="text-xs" style={{ color: "var(--accent-primary)" }}>{idea.outlierScore}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Estadísticas rápidas */}
          <div
            className="rounded-xl p-4 border space-y-3"
            style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Esta semana
            </p>
            {weekDays.map((day, i) => {
              const count = getIdeasForDay(day).length;
              return count > 0 ? (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span style={{ color: "var(--text-secondary)" }}>
                    {day.toLocaleDateString("es-AR", { weekday: "short", day: "numeric" })}
                  </span>
                  <span className="font-semibold" style={{ color: "var(--accent-primary)" }}>
                    {count} video{count > 1 ? "s" : ""}
                  </span>
                </div>
              ) : null;
            })}
            {weekDays.every((day) => getIdeasForDay(day).length === 0) && (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Sin videos esta semana</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
