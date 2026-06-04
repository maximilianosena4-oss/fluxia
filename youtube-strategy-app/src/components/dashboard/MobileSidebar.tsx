"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard",              label: "Inicio",            icon: "🏠" },
  { href: "/dashboard/evaluator",    label: "Evaluar Nicho",     icon: "⚡" },
  { href: "/dashboard/consultant",   label: "Consultor IA",      icon: "🤖" },
  { href: "/dashboard/roadmap",      label: "Plan de Acción",    icon: "🗺️" },
  { href: "/dashboard/ideas",        label: "Content Factory",   icon: "💡" },
  { href: "/dashboard/analytics",    label: "Analytics",         icon: "📊" },
  { href: "/dashboard/calendar",     label: "Calendario",        icon: "📅" },
  { href: "/dashboard/scripts",      label: "Guiones",           icon: "✍️" },
  { href: "/dashboard/thumbnails",   label: "Thumbnails",        icon: "🖼️" },
  { href: "/dashboard/tools",        label: "Herramientas",      icon: "🛠️" },
  { href: "/dashboard/comparator",   label: "Comparador",        icon: "⚖️" },
  { href: "/dashboard/settings",     label: "Configuración",     icon: "⚙️" },
];

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Cerrar al cambiar de ruta — patrón válido para drawers de navegación
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setOpen(false); }, [pathname]);

  // Cerrar con Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden p-2 rounded-lg transition-colors"
        style={{ color: "var(--text-secondary)" }}
        aria-label="Abrir menú"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full w-64 z-40 flex flex-col border-r transition-transform duration-300 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border-default)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border-default)" }}>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black text-white"
              style={{ background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))" }}
            >
              F
            </div>
            <span className="font-bold" style={{ color: "var(--text-primary)" }}>FluxIA</span>
          </div>
          <button onClick={() => setOpen(false)} style={{ color: "var(--text-muted)" }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all"
                style={
                  isActive
                    ? { backgroundColor: "var(--accent-primary)", color: "white" }
                    : { color: "var(--text-secondary)" }
                }
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
