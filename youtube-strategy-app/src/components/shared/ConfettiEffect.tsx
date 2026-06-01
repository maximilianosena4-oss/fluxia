"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

interface ConfettiEffectProps {
  trigger: boolean;
  variant?: "success" | "gold";
}

export function ConfettiEffect({ trigger, variant = "success" }: ConfettiEffectProps) {
  useEffect(() => {
    if (!trigger) return;

    const colors =
      variant === "gold"
        ? ["#f59e0b", "#fbbf24", "#fde68a", "#ffffff"]
        : ["#6366f1", "#8b5cf6", "#10b981", "#f1f5f9"];

    const fire = (opts: confetti.Options) =>
      confetti({ origin: { y: 0.6 }, colors, ...opts });

    void fire({ spread: 26, startVelocity: 55, particleCount: 40 });
    void fire({ spread: 60, particleCount: 50 });
    void fire({ spread: 100, decay: 0.91, scalar: 0.8, particleCount: 60 });
    void fire({ spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, particleCount: 40 });
    void fire({ spread: 120, startVelocity: 45, particleCount: 50 });
  }, [trigger, variant]);

  return null;
}
