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
          await streamMockResponse(controller, encoder, message);
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
  userMessage: string
) {
  const mockResponse = `**ANÁLISIS:** Basándome en tu pregunta sobre "${userMessage.slice(0, 50)}..." y los principios de los 5 mentores.

**RECOMENDACIÓN:** Antes de avanzar, necesitás evaluar tu nicho con el Evaluador de NEXUS. Esto te dará un score objetivo que me permite darte consejos más precisos.

**ACCIÓN SIGUIENTE:** Andá a /dashboard/evaluator y completá el wizard de 5 pasos. Tarda menos de 10 minutos.

**TIEMPO ESTIMADO:** 10 minutos para la evaluación completa.

**HERRAMIENTA:** NEXUS Evaluador de Nichos + YouTube API.

**FUENTE:** Adrián Sáenz — "El proceso comienza con la validación del nicho. Sin esto, todo lo demás es construir sobre arena."

¿Ya tenés un nicho en mente? ¿Querés que te ayude a definirlo antes de la evaluación?

> ⚠️ *Modo demo: configurá ANTHROPIC_API_KEY o OPENAI_API_KEY en .env.local para respuestas reales.*`;

  const words = mockResponse.split(" ");
  for (const word of words) {
    const data = `data: ${JSON.stringify({ text: word + " " })}\n\n`;
    controller.enqueue(encoder.encode(data));
    await new Promise((r) => setTimeout(r, 30));
  }
}
