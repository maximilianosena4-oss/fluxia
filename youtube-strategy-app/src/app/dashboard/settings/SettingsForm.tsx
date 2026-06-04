"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Props {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    plan: string;
    createdAt: string;
  };
  channel: {
    id: string;
    niche: string;
    youtubeChannelId: string;
    score: number | null;
  };
  stats: {
    evaluationsCount: number;
    ideasCount: number;
  };
  integrations: {
    supabase: boolean;
    googleAuth: boolean;
    anthropic: boolean;
    youtube: boolean;
    openai: boolean;
    upstash: boolean;
  };
}

export function SettingsForm({ user, channel, stats, integrations }: Props) {
  const [ytChannelId, setYtChannelId] = useState(channel.youtubeChannelId);
  const [saving, setSaving] = useState(false);

  async function saveChannelId() {
    if (!ytChannelId.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/settings/channel", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtubeChannelId: ytChannelId.trim() }),
      });
      if (res.ok) {
        toast.success("Canal de YouTube vinculado correctamente");
      } else {
        toast.error("Error al guardar. Intentá de nuevo.");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Perfil */}
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Tu información de cuenta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {user.image && (
              <Image
                src={user.image}
                alt={user.name}
                width={56}
                height={56}
                className="rounded-full"
              />
            )}
            <div className="flex-1 space-y-1">
              <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                {user.name || "Sin nombre"}
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {user.email}
              </p>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: "var(--accent-primary)20",
                    color: "var(--accent-primary)",
                  }}
                >
                  Plan {user.plan}
                </span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Miembro desde {new Date(user.createdAt).toLocaleDateString("es-AR", { month: "long", year: "numeric" })}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <Card>
        <CardHeader>
          <CardTitle>Tu actividad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: "Evaluaciones", value: stats.evaluationsCount },
              { label: "Ideas generadas", value: stats.ideasCount },
              { label: "Score del nicho", value: channel.score ? `${Math.round(channel.score)}/96` : "—" },
            ].map((stat) => (
              <div key={stat.label} className="space-y-1">
                <p className="text-2xl font-black tabular-nums" style={{ color: "var(--accent-primary)" }}>
                  {stat.value}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Canal de YouTube */}
      <Card>
        <CardHeader>
          <CardTitle>Canal de YouTube</CardTitle>
          <CardDescription>
            Vinculá tu canal para que FluxIA use tus métricas reales
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {channel.niche && (
            <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Nicho actual: <span className="font-medium" style={{ color: "var(--text-primary)" }}>{channel.niche}</span>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              ID del canal de YouTube
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={ytChannelId}
                onChange={(e) => setYtChannelId(e.target.value)}
                placeholder="ej: UCxxxxxxxxxxxxxxx"
                className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none border"
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: "var(--border-default)",
                  color: "var(--text-primary)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent-primary)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
              />
              <Button onClick={() => void saveChannelId()} loading={saving} disabled={!ytChannelId.trim()}>
                Guardar
              </Button>
            </div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Lo encontrás en YouTube Studio → Configuración → Info del canal → ID del canal
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Variables de entorno pendientes */}
      <Card>
        <CardHeader>
          <CardTitle>Integraciones</CardTitle>
          <CardDescription>Estado de las APIs conectadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: "Supabase (DB)",       status: integrations.supabase,   desc: integrations.supabase   ? "Base de datos activa"              : "Agrega DATABASE_URL en .env.local" },
              { name: "Google OAuth",        status: integrations.googleAuth, desc: integrations.googleAuth ? "Login con Google activo"           : "Agrega GOOGLE_CLIENT_ID y SECRET" },
              { name: "Anthropic Claude",    status: integrations.anthropic,  desc: integrations.anthropic  ? "Consultor IA activo"               : "Agrega ANTHROPIC_API_KEY en .env.local" },
              { name: "YouTube Data API",    status: integrations.youtube,    desc: integrations.youtube    ? "API de YouTube conectada"          : "Agrega YOUTUBE_API_KEY en .env.local" },
              { name: "OpenAI (embeddings)", status: integrations.openai,     desc: integrations.openai     ? "RAG con embeddings reales activo"  : "Agrega OPENAI_API_KEY para RAG real" },
              { name: "Upstash Redis",       status: integrations.upstash,    desc: integrations.upstash    ? "Rate limiting activo"              : "Opcional — agrega UPSTASH_REDIS_REST_URL" },
            ].map((item) => (
              <div key={item.name} className="flex items-center gap-3">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.status ? "var(--accent-success)" : "var(--text-muted)" }}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.name}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{item.desc}</p>
                </div>
                <span
                  className="text-xs font-medium"
                  style={{ color: item.status ? "var(--accent-success)" : "var(--text-muted)" }}
                >
                  {item.status ? "✓ Activo" : "Pendiente"}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
