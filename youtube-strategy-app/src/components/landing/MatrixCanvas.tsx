"use client";

import { useEffect, useRef } from "react";

const CHARS =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン" +
  "0123456789ABCDEFΣΔΩ∞←→";

export function MatrixCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const FS = 14;
    let drops: number[] = [];

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
      const cols = Math.floor(canvas!.width / FS);
      drops = Array.from({ length: cols }, () => Math.random() * -60);
    }

    resize();

    function draw() {
      if (!ctx || !canvas) return;

      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const hw = canvas.width / 2;

      ctx.font = `${FS}px monospace`;

      drops.forEach((y, i) => {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        const colX = i * FS;
        const dist = Math.abs(colX - cx) / hw; // 0 = centro, 1 = borde
        const base = 0.08 + dist * 0.72;       // más denso en los bordes
        const rnd = Math.random();

        ctx.fillStyle =
          rnd > 0.97
            ? `rgba(255,255,255,${base * 0.85})`
            : `rgba(0,255,65,${base * (0.35 + rnd * 0.5)})`;

        ctx.fillText(char, colX, y * FS);

        if (y * FS > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    }

    const interval = setInterval(draw, 48);
    window.addEventListener("resize", resize);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        display: "block",
        pointerEvents: "none",
      }}
    />
  );
}
