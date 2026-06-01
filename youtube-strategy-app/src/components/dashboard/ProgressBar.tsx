"use client";

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  showValue?: boolean;
  color?: string;
  height?: number;
  animated?: boolean;
}

export function ProgressBar({
  value,
  label,
  showValue = true,
  color = "var(--accent-primary)",
  height = 8,
  animated = true,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className="space-y-1.5">
      {(label || showValue) && (
        <div className="flex items-center justify-between text-sm">
          {label && (
            <span style={{ color: "var(--text-secondary)" }}>{label}</span>
          )}
          {showValue && (
            <span className="font-semibold" style={{ color }}>
              {clamped}%
            </span>
          )}
        </div>
      )}
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height, backgroundColor: "var(--bg-card)" }}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={animated ? "transition-all duration-700 ease-out" : ""}
          style={{
            width: `${clamped}%`,
            height: "100%",
            backgroundColor: color,
            borderRadius: "inherit",
          }}
        />
      </div>
    </div>
  );
}
