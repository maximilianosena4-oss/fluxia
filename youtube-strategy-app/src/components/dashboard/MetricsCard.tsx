"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface MetricsCardProps {
  title: string;
  value: string | number | null;
  unit?: string;
  subtitle?: string;
  icon: React.ReactNode;
  accentColor?: string;
  trend?: "up" | "down" | "neutral";
}

function useCountUp(target: number | null, duration = 900): number | null {
  const [current, setCurrent] = useState<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (target === null) { setCurrent(null); return; }
    const start = Date.now();
    const from = 0;
    const safeTarget = target;
    function tick() {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(from + (safeTarget - from) * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return current;
}

export function MetricsCard({
  title,
  value,
  unit,
  subtitle,
  icon,
  accentColor = "var(--accent-primary)",
  trend,
}: MetricsCardProps) {
  const numericTarget = typeof value === "number" ? value : null;
  const animated = useCountUp(numericTarget);
  const displayValue = value === null
    ? "—"
    : typeof value === "number" && animated !== null
    ? animated
    : value;

  return (
    <Card className="relative overflow-hidden card-hover group">
      {/* Accent gradient top */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
      />

      {/* Subtle glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at top, ${accentColor}0A 0%, transparent 70%)` }}
      />

      <CardContent className="pt-2 relative">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              {title}
            </p>
            <div className="flex items-baseline gap-1.5">
              <span
                className="text-3xl font-black tabular-nums leading-none"
                style={{ color: value === null ? "var(--text-muted)" : "var(--text-primary)" }}
              >
                {displayValue}
              </span>
              {unit && (
                <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  {unit}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {subtitle}
              </p>
            )}
          </div>

          {/* Icon con glow */}
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
            style={{
              backgroundColor: `${accentColor}18`,
              color: accentColor,
              boxShadow: `0 0 0 0 ${accentColor}40`,
            }}
          >
            {icon}
          </div>
        </div>

        {trend && (
          <div className="mt-3 flex items-center gap-1.5 text-xs">
            {trend === "up" && (
              <>
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "rgba(16,185,129,0.15)" }}
                >
                  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20" style={{ color: "var(--accent-success)" }}>
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" />
                  </svg>
                </div>
                <span style={{ color: "var(--accent-success)" }}>En crecimiento</span>
              </>
            )}
            {trend === "neutral" && (
              <span style={{ color: "var(--text-muted)" }}>Sin datos aún</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
