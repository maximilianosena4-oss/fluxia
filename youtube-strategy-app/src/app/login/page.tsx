// /login — FASE 2: Login completo con Google OAuth y animaciones Momentum UI
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="text-center space-y-6 px-4">
        <div>
          <h1
            className="text-4xl font-bold tracking-tight"
            style={{ color: "var(--accent-primary)" }}
          >
            NEXUS
          </h1>
          <p
            className="mt-2 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            Tu consultor IA de YouTube
          </p>
        </div>
        <p style={{ color: "var(--text-muted)" }}>
          Login con Google — próximamente (FASE 2)
        </p>
      </div>
    </div>
  );
}
