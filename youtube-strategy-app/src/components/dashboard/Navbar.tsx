"use client";

import Image from "next/image";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import type { AppUser } from "@/types";

interface NavbarProps {
  user: AppUser | null;
  roadmapProgress: number;
}

export function Navbar({ user, roadmapProgress }: NavbarProps) {
  return (
    <header
      className="fixed top-0 left-60 right-0 h-16 flex items-center justify-between px-6 border-b z-10"
      style={{
        backgroundColor: "var(--bg-primary)",
        borderColor: "var(--border-default)",
      }}
    >
      {/* Progress bar global */}
      <div className="flex items-center gap-4 flex-1">
        <div className="hidden sm:flex items-center gap-2 text-sm">
          <span style={{ color: "var(--text-muted)" }}>Progreso:</span>
          <div
            className="w-48 h-2 rounded-full overflow-hidden"
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
          <span className="font-semibold" style={{ color: "var(--accent-primary)" }}>
            {roadmapProgress}%
          </span>
        </div>
      </div>

      {/* User menu */}
      <div className="flex items-center gap-3">
        {user?.image && (
          <Image
            src={user.image}
            alt={user.name ?? "Usuario"}
            width={32}
            height={32}
            className="rounded-full"
          />
        )}
        <span className="text-sm hidden md:block" style={{ color: "var(--text-secondary)" }}>
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
