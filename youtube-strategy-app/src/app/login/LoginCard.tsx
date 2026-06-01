"use client";

import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const MENTORS = ["Eloisa Wolf", "Adrián Sáenz", "Eric Alanis", "Alex Hormozi", "MrBeast"];

export function LoginCard({ error }: { error?: string }) {
  const [loading, setLoading] = useState(false);

  async function handleGoogleSignIn() {
    setLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      {/* Background gradient blob */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, var(--accent-primary), var(--accent-secondary))" }}
      />

      <motion.div
        className="w-full max-w-sm space-y-8 relative z-10"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Logo */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl text-2xl font-black text-white"
            style={{ background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))" }}
          >
            N
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              NEXUS
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Tu canal de YouTube que genera ingresos.<br />
              <span style={{ color: "var(--accent-primary)" }}>Paso a paso, con IA.</span>
            </p>
          </div>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-2xl p-8 space-y-6 border"
          style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
        >
          <div className="text-center space-y-1">
            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              Comenzar gratis
            </h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Sin tarjeta de crédito. Sin complicaciones.
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-lg px-4 py-3 text-sm"
              style={{
                backgroundColor: "rgba(239,68,68,0.1)",
                color: "var(--accent-danger)",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              {error === "OAuthAccountNotLinked"
                ? "Esta cuenta ya está vinculada a otro acceso."
                : "Error al iniciar sesión. Intentá de nuevo."}
            </motion.div>
          )}

          <Button
            onClick={() => void handleGoogleSignIn()}
            loading={loading}
            size="lg"
            className="w-full gap-3"
            style={{ backgroundColor: "white", color: "#1f2937", fontWeight: 600 }}
          >
            {!loading && (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {loading ? "Redirigiendo..." : "Continuar con Google"}
          </Button>

          <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
            Al continuar, aceptás que usemos tu cuenta de Google para identificarte.
          </p>
        </motion.div>

        {/* Social proof */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xs text-center"
          style={{ color: "var(--text-muted)" }}
        >
          Basado en estrategias de{" "}
          {MENTORS.map((m, i) => (
            <span key={m}>
              <span style={{ color: "var(--text-secondary)" }}>{m}</span>
              {i < MENTORS.length - 1 ? " · " : ""}
            </span>
          ))}
        </motion.p>
      </motion.div>
    </div>
  );
}
