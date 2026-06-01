// Layout compartido para todas las rutas /dashboard/*
// FASE 2: Implementación completa con sidebar, navbar y auth check
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s | NEXUS" },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      {/* FASE 2: Aquí irá el Sidebar + Navbar */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
