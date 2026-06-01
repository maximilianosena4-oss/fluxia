"use client";

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

export function MetricsCard({
  title,
  value,
  unit,
  subtitle,
  icon,
  accentColor = "var(--accent-primary)",
  trend,
}: MetricsCardProps) {
  const displayValue = value === null ? "—" : value;

  return (
    <Card className="relative overflow-hidden">
      {/* Accent line top */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ backgroundColor: accentColor }}
      />

      <CardContent className="pt-1">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              {title}
            </p>
            <div className="flex items-baseline gap-1">
              <span
                className="text-3xl font-bold tabular-nums"
                style={{ color: "var(--text-primary)" }}
              >
                {displayValue}
              </span>
              {unit && (
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
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

          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: `${accentColor}20`,
              color: accentColor,
            }}
          >
            {icon}
          </div>
        </div>

        {trend && (
          <div className="mt-3 flex items-center gap-1 text-xs">
            {trend === "up" && (
              <>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" style={{ color: "var(--accent-success)" }}>
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" />
                </svg>
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
