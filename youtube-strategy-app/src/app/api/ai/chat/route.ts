// POST /api/ai/chat — Consultor IA con streaming SSE
// RAG: embeddings → pgvector → contexto → Anthropic/OpenAI
// Responde en menos de 5 segundos con streaming visible

import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { retrieveContext, buildRAGPrompt } from "@/lib/ai/rag";
import { NEXUS_SYSTEM_PROMPT, buildUserContext } from "@/lib/ai/prompts";
import { sanitizeForLLM } from "@/lib/security/sanitize";
import { checkRateLimit } from "@/lib/security/rateLimit";
import { logAuditEvent } from "@/lib/security/audit";

const RequestSchema = z.object({
  message: z.string().min(1).max(2000),
  context: z.object({
    nicheScore:            z.number().nullable().optional(),
    roadmapProgress:       z.number().min(0).max(100).default(0),
    currentNiche:          z.string().nullable().optional(),
    lastCompletedActions:  z.array(z.string()).default([]),
  }).optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const rl = await checkRateLimit(session.user.id, "ai");
  if (!rl.success) {
    return NextResponse.json(
      { error: "Demasiadas consultas. Esperá un minuto." },
      { status: 429 }
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

  const { message, context } = parsed.data;
  const { safe, sanitized } = sanitizeForLLM(message);
  if (!safe) {
    return NextResponse.json({ error: "Mensaje inválido" }, { status: 400 });
  }

  void logAuditEvent({
    userId: session.user.id,
    action: "ai_query",
    metadata: { messageLength: message.length },
  });

  const ragChunks = await retrieveContext(message);
  const userCtx = buildUserContext({
    nicheScore:    context?.nicheScore    ?? null,
    roadmapProgress: context?.roadmapProgress ?? 0,
    currentNiche:  context?.currentNiche  ?? null,
    lastActions:   context?.lastCompletedActions ?? [],
  });

  const systemPrompt = NEXUS_SYSTEM_PROMPT.replace("{{USER_CONTEXT}}", userCtx);
  const fullPrompt = buildRAGPrompt(systemPrompt, ragChunks, sanitized);

  // ─── Streaming SSE ────────────────────────────────────────
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        if (process.env.ANTHROPIC_API_KEY) {
          await streamWithAnthropic(controller, encoder, fullPrompt, sanitized);
        } else if (process.env.OPENAI_API_KEY) {
          await streamWithOpenAI(controller, encoder, fullPrompt, sanitized);
        } else {
          await streamMockResponse(controller, encoder, message, ragChunks);
        }
      } catch (err) {
        const errorMsg = `data: ${JSON.stringify({ error: "Error al generar respuesta" })}\n\n`;
        controller.enqueue(encoder.encode(errorMsg));
      } finally {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

async function streamWithAnthropic(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  systemPrompt: string,
  userMessage: string
) {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const stream = await client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    temperature: 0.3,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  for await (const chunk of stream) {
    if (
      chunk.type === "content_block_delta" &&
      chunk.delta.type === "text_delta"
    ) {
      const data = `data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`;
      controller.enqueue(encoder.encode(data));
    }
  }
}

async function streamWithOpenAI(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  systemPrompt: string,
  userMessage: string
) {
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const stream = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 2000,
    temperature: 0.3,
    stream: true,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userMessage },
    ],
  });

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content ?? "";
    if (text) {
      const data = `data: ${JSON.stringify({ text })}\n\n`;
      controller.enqueue(encoder.encode(data));
    }
  }
}

async function streamMockResponse(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  userMessage: string,
  ragChunks: import("@/types/ai").KnowledgeChunk[] = []
) {
  const topChunk = ragChunks[0];
  const authorName = topChunk?.author
    ? topChunk.author.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    : "Adrián Sáenz";
  const sourceText = topChunk?.chunkText?.slice(0, 120) ?? "El proceso comienza con la validación del nicho.";

  const mockResponse = `**ANÁLISIS:** Revisé tu consulta sobre "${userMessage.slice(0, 60)}..." y la cruzo con mi base de conocimiento de los 5 mentores.

**RECOMENDACIÓN:** ${
    userMessage.toLowerCase().includes("nicho")
      ? "Validá tu nicho con el Evaluador de NEXUS antes de cualquier otra acción. Un nicho mal elegido arruina todo lo que construís encima."
      : userMessage.toLowerCase().includes("video") || userMessage.toLowerCase().includes("contenido")
      ? "Aplicá la estructura de MrBeast: Gancho (0-30s) → Problema → Solución → CTA. El thumbnail vale más que el contenido en sí."
      : userMessage.toLowerCase().includes("monetiz") || userMessage.toLowerCase().includes("dinero")
      ? "Siguiendo a Hormozi: diseñá tu oferta backend ANTES de crear el canal. El contenido son anuncios gratuitos de lo que vendés."
      : "Completá primero la evaluación de nicho — sin eso no puedo darte consejos precisos. Es el paso que define todo."
  }

**ACCIÓN SIGUIENTE:** ${
    userMessage.toLowerCase().includes("nicho")
      ? "Usá el Evaluador de NEXUS (/dashboard/evaluator). Tardás menos de 10 minutos y obtenés un score de 0-96."
      : "Evaluá tu nicho en /dashboard/evaluator si aún no lo hiciste. Después volvé con preguntas más específicas."
  }

**TIEMPO ESTIMADO:** 10-15 minutos.

**HERRAMIENTA:** NEXUS Evaluador + YouTube API (modo mock hasta que configures YOUTUBE_API_KEY).

**FUENTE:** ${authorName} — "${sourceText}..."

¿Querés que profundice en algún aspecto específico?

> ⚠️ *Modo demo activo — configurá ANTHROPIC_API_KEY en .env.local para respuestas IA reales.*`;

  const words = mockResponse.split(" ");
  for (const word of words) {
    const data = `data: ${JSON.stringify({ text: word + " " })}\n\n`;
    controller.enqueue(encoder.encode(data));
    await new Promise((r) => setTimeout(r, 30));
  }
}
