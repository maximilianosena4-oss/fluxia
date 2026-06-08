// POST /api/pipeline/generate — Genera el contenido de un paso del wizard

import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { searchVideos } from "@/lib/youtube/client";
import {
  generateScript,
  generateTitles,
  generateThumbnailConcept,
  generateSEO,
} from "@/lib/ai/anthropic";
import { sanitizeForLLM } from "@/lib/security/sanitize";
import { checkRateLimit, rateLimitHeaders } from "@/lib/security/rateLimit";

const RequestSchema = z.object({
  step: z.enum(["research", "outline", "script", "titles", "thumbnail", "seo"]),
  topic: z.string().min(2).max(200),
  niche: z.string().min(2).max(100),
  style: z.string().min(2).max(50),
  selectedTitle: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const rl = await checkRateLimit(session.user.id, "ai");
  if (!rl.success) {
    return NextResponse.json(
      { error: "Demasiadas consultas" },
      { status: 429, headers: rateLimitHeaders(rl, "ai") }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { step, topic, niche, style, selectedTitle } = parsed.data;

  const { safe: topicSafe } = sanitizeForLLM(topic);
  const { safe: nicheSafe } = sanitizeForLLM(niche);
  if (!topicSafe || !nicheSafe) {
    return NextResponse.json({ error: "Input inválido" }, { status: 400 });
  }

  switch (step) {
    case "research": {
      const videos = await searchVideos(`${topic} ${niche}`, 10);
      return NextResponse.json({
        data: videos
          .sort((a, b) => b.viewCount - a.viewCount)
          .slice(0, 6)
          .map((v) => ({
            id: v.id,
            title: v.title,
            channelTitle: v.channelTitle,
            viewCount: v.viewCount,
            thumbnailUrl: v.thumbnailUrl,
            publishedAt: v.publishedAt,
          })),
      });
    }

    case "outline": {
      const { default: Anthropic } = await import("@anthropic-ai/sdk");
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      try {
        const msg = await client.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 1500,
          messages: [
            {
              role: "user",
              content: `Generate a YouTube video outline for:
Topic: ${topic}
Niche: ${niche}
Style: ${style}

Respond ONLY with valid JSON:
{
  "hook": "string (attention-grabbing opening)",
  "sections": [
    { "title": "string", "duration": "string (e.g. 2 min)", "keyPoints": ["string"] }
  ],
  "cta": "string (call to action)",
  "totalDuration": "string (e.g. 10-12 minutes)"
}`,
            },
          ],
        });
        const raw = msg.content[0].type === "text" ? msg.content[0].text : "{}";
        const match = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        const outline = JSON.parse(match ? match[1] : raw) as unknown;
        return NextResponse.json({ data: outline });
      } catch {
        return NextResponse.json({
          data: {
            hook: `Start with: "What if ${topic} could change your life in 30 days?"`,
            sections: [
              { title: "Introduction", duration: "1-2 min", keyPoints: [`Why ${topic} matters`, "What you'll learn"] },
              { title: "Main Content", duration: "5-7 min", keyPoints: ["Step 1", "Step 2", "Step 3"] },
              { title: "Results & Proof", duration: "2-3 min", keyPoints: ["Real examples", "Data"] },
            ],
            cta: "Like, subscribe, and comment your experience below",
            totalDuration: "8-12 minutes",
          },
        });
      }
    }

    case "script": {
      const script = await generateScript(topic, niche, style, "8-12 minutes");
      return NextResponse.json({ data: script });
    }

    case "titles": {
      const titles = await generateTitles(topic, niche, style, 10);
      return NextResponse.json({ data: titles });
    }

    case "thumbnail": {
      const title = selectedTitle ?? topic;
      const concept = await generateThumbnailConcept(topic, niche, title);
      return NextResponse.json({ data: concept });
    }

    case "seo": {
      const title = selectedTitle ?? topic;
      const seo = await generateSEO(title, topic, niche);
      return NextResponse.json({ data: seo });
    }

    default:
      return NextResponse.json({ error: "Paso inválido" }, { status: 400 });
  }
}
