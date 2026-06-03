"use client";

// ─────────────────────────────────────────────────────────
// FLUXIA HERO — Matrix Edition
// Componente: título hero animado con lluvia de código
// Marca: FluxIA | YouTube Intelligence
// ─────────────────────────────────────────────────────────

import { useEffect, useRef } from "react";

export function FluxiaHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // ─────────────────────────────────────────────────────
    // FLUXIA MATRIX RAIN
    // Canvas animation — lluvia de código estilo Matrix
    // Caracteres: hexadecimal + katakana + símbolos matemáticos
    // Paleta: verde Matrix dominante + destellos cyan y blanco
    // ─────────────────────────────────────────────────────

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const CHARS =
      "0123456789ABCDEF" +
      "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン" +
      "ΣΔΩ∞±∫×∑«→ ↑↓←↔";

    const FS = 14;
    let cols = 0;
    const drops: number[] = [];

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
      cols = Math.floor(canvas!.width / FS);
      while (drops.length < cols) {
        drops.push(Math.random() * -(canvas!.height / FS));
      }
      drops.length = cols;
    }

    resize();
    window.addEventListener("resize", resize);

    function draw() {
      if (!ctx || !canvas) return;

      ctx.fillStyle = "rgba(0, 0, 0, 0.045)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${FS}px monospace`;

      for (let i = 0; i < cols; i++) {
        const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
        const x = i * FS;
        const y = drops[i] * FS;
        const rnd = Math.random();

        if (rnd > 0.97) {
          ctx.fillStyle = "#FFFFFF";
          ctx.shadowColor = "#FFFFFF";
          ctx.shadowBlur = 10;
        } else if (rnd > 0.92) {
          ctx.fillStyle = "#00EFFF";
          ctx.shadowColor = "#00EFFF";
          ctx.shadowBlur = 8;
        } else {
          const alpha = rnd > 0.6 ? "FF" : rnd > 0.35 ? "BB" : "55";
          ctx.fillStyle = `#00${alpha}41`;
          ctx.shadowColor = "#00FF41";
          ctx.shadowBlur = rnd > 0.8 ? 4 : 0;
        }

        ctx.fillText(ch, x, y);
        ctx.shadowBlur = 0;

        if (y > canvas.height && Math.random() > 0.974) {
          drops[i] = 0;
        }
        drops[i] += 0.45;
      }
    }

    const intervalId = setInterval(draw, 38);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("resize", resize);
    };

    // ─────────────────────────────────────────────────────
    // FIN FLUXIA MATRIX RAIN
    // ─────────────────────────────────────────────────────
  }, []);

  return (
    <>
      {/* ─────────────────────────────────────────────────
          FLUXIA HERO — Matrix Edition
          Componente: título hero animado
          Marca: FluxIA | YouTube Intelligence
          ───────────────────────────────────────────────── */}

      <canvas ref={canvasRef} id="fluxia-matrix" />
      <div className="fluxia-overlay" />

      <section className="fluxia-hero">
        <div className="fluxia-logo">
          <span className="fluxia-flux">Flux</span>
          <span className="fluxia-i">I</span>
          <span className="fluxia-a">A</span>
        </div>
        <p className="fluxia-subtitle">
          Análisis de Contenido
          <span className="fluxia-dot">·</span>
          YouTube Intelligence
        </p>
      </section>
    </>
  );
}
