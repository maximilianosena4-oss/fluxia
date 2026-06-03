// POST /api/ai/ideas — Generador de ideas con Outlier Test (YouTube API + IA)

import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { searchVideos } from "@/lib/youtube/client";
import { sanitizeForLLM } from "@/lib/security/sanitize";
import { checkRateLimit, rateLimitHeaders } from "@/lib/security/rateLimit";

const RequestSchema = z.object({
  niche: z.string().min(2).max(100),
  count: z.number().int().min(1).max(10).default(5),
});

export interface ContentIdeaResult {
  id: string;
  title: string;
  hook: string;
  differentiator: string;
  viralityScore: number;
  outlierInspiration: string;
  estimatedRpm: number;
  productionTool: string;
  thumbnailPrompt: string;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const rl = await checkRateLimit(session.user.id, "ai");
  if (!rl.success) {
    return NextResponse.json({ error: "Demasiadas consultas" }, { status: 429, headers: rateLimitHeaders(rl, "ai") });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { niche, count } = parsed.data;
  const { safe } = sanitizeForLLM(niche);
  if (!safe) return NextResponse.json({ error: "Input inválido" }, { status: 400 });

  const videos = await searchVideos(niche, 20, "es");
  const topVideos = videos.sort((a, b) => b.viewCount - a.viewCount).slice(0, 5);

  if (process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY) {
    return await generateWithAI(niche, count, topVideos);
  }

  return NextResponse.json({ ideas: generateMockIdeas(niche, count, topVideos) });
}

async function generateWithAI(
  niche: string,
  count: number,
  topVideos: Array<{ title: string; viewCount: number }>
): Promise<Response> {
  const prompt = `Generá ${count} ideas de video para el nicho "${niche}" en español.
Videos de referencia más virales:
${topVideos.map((v, i) => `${i + 1}. "${v.title}" — ${v.viewCount.toLocaleString()} vistas`).join("\n")}

Para cada idea devolvé un JSON array con:
{
  "id": "idea-N",
  "title": "título clickbait + específico",
  "hook": "gancho de los primeros 30 segundos",
  "differentiator": "ángulo único vs la competencia",
  "viralityScore": número del 0 al 100,
  "outlierInspiration": "qué video de referencia lo inspiró",
  "estimatedRpm": número en USD,
  "productionTool": "herramienta recomendada",
  "thumbnailPrompt": "prompt para generar el thumbnail con DALL-E/Midjourney"
}

Respondé SOLO con el JSON array, sin explicaciones.`;

  try {
    let ideasJson: string;

    if (process.env.ANTHROPIC_API_KEY) {
      const { default: Anthropic } = await import("@anthropic-ai/sdk");
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const msg = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 3000,
        temperature: 0.7,
        messages: [{ role: "user", content: prompt }],
      });
      ideasJson = msg.content[0].type === "text" ? msg.content[0].text : "[]";
    } else {
      const { default: OpenAI } = await import("openai");
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await client.chat.completions.create({
        model: "gpt-4o",
        temperature: 0.7,
        messages: [{ role: "user", content: prompt }],
      });
      ideasJson = completion.choices[0]?.message?.content ?? "[]";
    }

    const jsonMatch = ideasJson.match(/\[[\s\S]*\]/);
    const ideas = jsonMatch ? JSON.parse(jsonMatch[0]) as ContentIdeaResult[] : [];
    return NextResponse.json({ ideas });
  } catch {
    return NextResponse.json({ ideas: generateMockIdeas(niche, count, topVideos) });
  }
}

function generateMockIdeas(
  niche: string,
  count: number,
  topVideos: Array<{ title: string; viewCount: number }>
): ContentIdeaResult[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `idea-${i + 1}`,
    title: `[MOCK] ${i + 1} secretos de "${niche}" que nadie te contó en ${new Date().getFullYear()}`,
    hook: `Empezá con: "Si estás viendo este video es porque cometiste el error #${i + 1} de ${niche}..."`,
    differentiator: `Ángulo desde la perspectiva de un principiante que ya logró resultados en 30 días`,
    viralityScore: 75 - i * 5,
    outlierInspiration: topVideos[i % topVideos.length]?.title ?? "Video de referencia",
    estimatedRpm: 4.5,
    productionTool: "Claude AI + CapCut + ElevenLabs",
    thumbnailPrompt: `Thumbnail minimalista, fondo negro, texto "${niche.toUpperCase()}" en rojo, número grande "0${i + 1}" en blanco, estilo MrBeast`,
  }));
}
