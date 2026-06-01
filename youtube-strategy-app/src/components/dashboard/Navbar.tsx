"use client";

import Image from "next/image";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { MobileSidebar } from "./MobileSidebar";
import type { AppUser } from "@/types";

interface NavbarProps {
  user: AppUser | null;
  roadmapProgress: number;
}

export function Navbar({ user, roadmapProgress }: NavbarProps) {
  return (
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

        {/* Progress bar — solo desktop */}
        <div className="hidden sm:flex items-center gap-2 text-sm">
          <span style={{ color: "var(--text-muted)" }}>Progreso:</span>
          <div
            className="w-32 md:w-48 h-2 rounded-full overflow-hidden"
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
        {user?.image && (
          <Image
            src={user.image}
            alt={user.name ?? "Usuario"}
            width={30}
            height={30}
            className="rounded-full"
          />
        )}
        <span className="text-sm hidden md:block truncate max-w-[140px]" style={{ color: "var(--text-secondary)" }}>
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
  );
}
