// GET /api/youtube/channel?id=UCxxxxxxx
// Retorna estadísticas de un canal de YouTube con cache Redis 6h

import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getChannelStats } from "@/lib/youtube/client";
import { checkRateLimit } from "@/lib/security/rateLimit";

const QuerySchema = z.object({
  id: z.string().min(3).max(50),
});

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const rl = await checkRateLimit(session.user.id, "youtube");
  if (!rl.success) {
    return NextResponse.json({ error: "Demasiadas consultas. Esperá un minuto." }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = QuerySchema.safeParse({ id: searchParams.get("id") });

  if (!parsed.success) {
    return NextResponse.json({ error: "Se requiere el parámetro id" }, { status: 400 });
  }

  try {
    const channel = await getChannelStats(parsed.data.id);
    if (!channel) {
      return NextResponse.json({ error: "Canal no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ channel });
  } catch {
    return NextResponse.json({ error: "Error al obtener el canal" }, { status: 500 });
  }
}
