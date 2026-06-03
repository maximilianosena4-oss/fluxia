"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { MobileSidebar } from "./MobileSidebar";
import { GlobalSearch } from "./GlobalSearch";
import type { AppUser } from "@/types";

interface NavbarProps {
  user: AppUser | null;
  roadmapProgress: number;
}

export function Navbar({ user, roadmapProgress }: NavbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header
        className="fixed top-0 left-0 lg:left-60 right-0 h-16 flex items-center justify-between px-4 lg:px-6 border-b z-10"
        style={{
          backgroundColor: "var(--bg-primary)",
          borderColor: "var(--border-default)",
        }}
      >
        <div className="flex items-center gap-3 flex-1">
          {/* Mobile hamburger */}
          <MobileSidebar />

          {/* Buscador — botón clickeable + hint teclado */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-colors"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-default)",
              color: "var(--text-muted)",
            }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <span className="hidden sm:inline text-xs">Buscar…</span>
            <kbd
              className="hidden md:inline text-xs px-1 py-0.5 rounded"
              style={{
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border-default)",
                fontFamily: "inherit",
              }}
            >
              ⌘K
            </kbd>
          </button>

          {/* Progress bar — solo desktop */}
          <div className="hidden lg:flex items-center gap-2 text-sm">
            <span style={{ color: "var(--text-muted)" }}>Progreso:</span>
            <div
              className="w-32 xl:w-48 h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: "var(--bg-card)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${roadmapProgress}%`,
                  backgroundColor: "var(--accent-primary)",
                }}
              />
            </div>
            <span className="font-semibold text-xs" style={{ color: "var(--accent-primary)" }}>
              {roadmapProgress}%
            </span>
          </div>
        </div>

        {/* User menu */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg transition-colors"
            style={{ color: "var(--text-muted)" }}
            aria-label="Cambiar tema"
            title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
          >
            {theme === "dark" ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
              </svg>
            )}
          </button>
          {user?.image && (
            <Image
              src={user.image}
              alt={user.name ?? "Usuario"}
              width={30}
              height={30}
              className="rounded-full"
            />
          )}
          <span
            className="text-sm hidden md:block truncate max-w-[140px]"
            style={{ color: "var(--text-secondary)" }}
          >
            {user?.name ?? user?.email}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-xs"
          >
            Salir
          </Button>
        </div>
      </header>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
