// POST /api/ai/script — Generador de guiones de video completos
// Estructura basada en los principios de Adrián Sáenz + MrBeast

import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { sanitizeForLLM } from "@/lib/security/sanitize";
import { checkRateLimit, rateLimitHeaders } from "@/lib/security/rateLimit";

const RequestSchema = z.object({
  title: z.string().min(3).max(200),
  niche: z.string().min(2).max(100),
  hook: z.string().max(300).optional(),
  channelType: z.enum(["no-face-ai", "voice-only", "with-face"]).default("no-face-ai"),
  videoDuration: z.enum(["short", "medium", "long"]).default("medium"),
  targetAudience: z.string().max(200).optional(),
});

export interface VideoScript {
  title: string;
  estimatedDuration: string;
  sections: ScriptSection[];
  productionNotes: string[];
  seoTags: string[];
  thumbnailConcept: string;
}

export interface ScriptSection {
  name: string;
  timeCode: string;
  duration: string;
  objective: string;
  content: string;
  productionTip: string;
}

const DURATION_MAP = {
  short: { label: "6-8 minutos", seconds: 420 },
  medium: { label: "10-15 minutos", seconds: 750 },
  long: { label: "18-25 minutos", seconds: 1260 },
};

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const rl = await checkRateLimit(session.user.id, "ai");
  if (!rl.success) {
    return NextResponse.json({ error: "Demasiadas consultas. Esperá un minuto." }, { status: 429, headers: rateLimitHeaders(rl, "ai") });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { title, niche, hook, channelType, videoDuration, targetAudience } = parsed.data;
  const { safe } = sanitizeForLLM(title);
  if (!safe) return NextResponse.json({ error: "Título inválido" }, { status: 400 });

  // Generar con IA o mock
  const script = process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY
    ? await generateWithAI({ title, niche, hook, channelType, videoDuration, targetAudience })
    : generateMockScript({ title, niche, hook, channelType, videoDuration, targetAudience });

  return NextResponse.json({ script });
}

async function generateWithAI(params: z.infer<typeof RequestSchema>): Promise<VideoScript> {
  const { title, niche, hook, channelType, videoDuration, targetAudience } = params;
  const dur = DURATION_MAP[videoDuration];

  const prompt = `Generá un guión completo para YouTube sobre el tema: "${title}"
Nicho: ${niche}
Tipo de canal: ${channelType}
Duración objetivo: ${dur.label}
${targetAudience ? `Audiencia objetivo: ${targetAudience}` : ""}
${hook ? `Hook sugerido: ${hook}` : ""}

Seguí la estructura de Adrián Sáenz y MrBeast:
1. GANCHO (0-30s): Captura atención inmediata, NO reveles la respuesta todavía
2. PROMESA (30s-1min): Qué va a aprender/conseguir el espectador
3. CONTENIDO PRINCIPAL: Desarrollá en 3-5 bloques con curiosity loops
4. CIERRE + CTA: Llamada a la acción concreta

Respondé con JSON con esta estructura exacta:
{
  "title": string,
  "estimatedDuration": string,
  "sections": [{
    "name": string,
    "timeCode": string,
    "duration": string,
    "objective": string,
    "content": string (2-3 párrafos del guión real),
    "productionTip": string
  }],
  "productionNotes": string[],
  "seoTags": string[],
  "thumbnailConcept": string
}`;

  try {
    let response: string;

    if (process.env.ANTHROPIC_API_KEY) {
      const { default: Anthropic } = await import("@anthropic-ai/sdk");
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const msg = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 4000,
        temperature: 0.6,
        messages: [{ role: "user", content: prompt }],
      });
      response = msg.content[0].type === "text" ? msg.content[0].text : "";
    } else {
      const { default: OpenAI } = await import("openai");
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await client.chat.completions.create({
        model: "gpt-4o",
        temperature: 0.6,
        messages: [{ role: "user", content: prompt }],
      });
      response = completion.choices[0]?.message?.content ?? "";
    }

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]) as VideoScript;
  } catch (err) {
    console.error("[script] AI error:", err);
  }

  return generateMockScript(params);
}

function generateMockScript(params: z.infer<typeof RequestSchema>): VideoScript {
  const { title, niche, channelType, videoDuration } = params;
  const dur = DURATION_MAP[videoDuration];
  const isNoFace = channelType === "no-face-ai";

  return {
    title,
    estimatedDuration: dur.label,
    sections: [
      {
        name: "🎣 GANCHO (Hook)",
        timeCode: "0:00 - 0:30",
        duration: "30 segundos",
        objective: "Capturar atención en los primeros 3 segundos. Sin revelar la respuesta.",
        content: `[NARRACIÓN]: "El ${Math.floor(Math.random() * 90 + 10)}% de las personas que intentan ${niche} cometen este error y nunca lo descubren..."\n\n[PAUSA DRAMÁTICA — 1 segundo de silencio]\n\n"En este video te voy a mostrar exactamente qué hacer diferente. Y spoiler: no es lo que creés."\n\n${isNoFace ? "[B-ROLL: imágenes impactantes relacionadas al tema]" : "[CÁMARA: primer plano, mirada directa, expresión seria]"}`,
        productionTip: isNoFace
          ? "Usá ElevenLabs para la narración con tono urgente. El B-roll debe ser de alta calidad — Pexels o Storyblocks."
          : "Grabá de pie, buen iluminado. La primera expresión es crucial — practicá la cara antes de grabar.",
      },
      {
        name: "📢 PROMESA",
        timeCode: "0:30 - 1:30",
        duration: "60 segundos",
        objective: "Establecer qué aprenderá el espectador y por qué debe quedarse.",
        content: `[NARRACIÓN]: "Hoy vas a aprender:\n\n✅ Por qué la mayoría falla en ${niche}\n✅ El método exacto que usan los canales más exitosos\n✅ Cómo aplicarlo vos mismo desde cero, sin experiencia previa\n\nMe tomó [X tiempo] aprenderlo y [resultado]. Quedate hasta el final porque el punto número 3 es el que más diferencia hace."\n\n[MOSTRAR: lista visual animada de los puntos]`,
        productionTip: "Usá texto en pantalla para cada punto. Esto aumenta la retención — el espectador ve Y escucha al mismo tiempo.",
      },
      {
        name: "🔍 CONTENIDO — Parte 1",
        timeCode: "1:30 - 4:00",
        duration: "2.5 minutos",
        objective: "Primer bloque de valor. Crear curiosidad para la parte 2.",
        content: `[NARRACIÓN]: "Primero, entendamos por qué ${niche} es diferente a lo que te dijeron...\n\n[EXPLICACIÓN del primer punto con datos/ejemplos concretos]\n\nPero esperate, porque esto es solo la mitad de la historia. La parte 2 es donde la mayoría se equivoca..."\n\n[TRANSICIÓN: efecto visual + música que aumenta]`,
        productionTip: "Cada 60-90 segundos, cambiá el ángulo de cámara o el B-roll. Esto reinicia la atención del espectador.",
      },
      {
        name: "🔍 CONTENIDO — Parte 2",
        timeCode: "4:00 - 7:00",
        duration: "3 minutos",
        objective: "Segundo bloque. Aplicación práctica del concepto.",
        content: `[NARRACIÓN]: "Acá está lo que nadie te dice sobre ${niche}...\n\n[DEMOSTRACIÓN PRÁCTICA - paso a paso]\n\nCuando yo hice esto por primera vez, [resultado específico y creíble].\n\nY no fue suerte. Fue un sistema. Te lo explico."\n\n[MOSTRAR: proceso visual, capturas de pantalla, gráficos]`,
        productionTip: "Las demostraciones prácticas tienen el mayor tiempo de retención. Gravá la pantalla si es posible.",
      },
      {
        name: "💡 CONTENIDO — Parte 3 (El Secreto)",
        timeCode: "7:00 - 10:30",
        duration: "3.5 minutos",
        objective: "El punto más valioso. Esto es lo que hace que el video sea compartible.",
        content: `[NARRACIÓN]: "Y acá viene lo que cambió todo para mí. El punto 3 que prometí al principio...\n\n[REVELA el insight principal — el más sorprendente/valioso]\n\nEsto es exactamente lo opuesto a lo que la mayoría piensa sobre ${niche}.\n\n[EJEMPLO concreto con números/resultados reales o casos de éxito]"`,
        productionTip: "Este momento debe ser el pico emocional del video. Usá música más intensa, cortes más rápidos.",
      },
      {
        name: "🎯 CIERRE + CTA",
        timeCode: "10:30 - 11:00",
        duration: "30 segundos",
        objective: "Resumen + llamada a la acción clara y específica.",
        content: `[NARRACIÓN]: "Entonces, para resumir:\n\n1️⃣ [Punto 1 en una frase]\n2️⃣ [Punto 2 en una frase]\n3️⃣ [Punto 3 — el más importante]\n\nSi te sirvió este video, suscribite porque la próxima semana subo [tema relacionado que ya querés ver].\n\nY comentame: ¿cuál de estos puntos vas a aplicar primero?"`,
        productionTip: "El CTA de comentarios aumenta el engagement significativamente. Hacé una pregunta específica, no genérica.",
      },
    ],
    productionNotes: [
      `Duración total objetivo: ${dur.label} — mantener el ritmo es clave`,
      isNoFace ? "Herramientas recomendadas: ElevenLabs (voz) + Pictory o CapCut (edición) + Pexels (B-roll)" : "Grabá en un lugar limpio, bien iluminado. Usa micrófono externo si podés.",
      "Thumbnail: texto en grande, cara expresiva (o imagen impactante si es sin rostro), colores contrastantes",
      "Título SEO: incluir la keyword principal al inicio, agregar número o promesa específica",
      "Subí el video entre martes y jueves 14-18h (hora argentina) para mayor alcance inicial",
      "Primeros 48h son cruciales — respondé TODOS los comentarios para señal de engagement",
    ],
    seoTags: [
      niche,
      `${niche} 2025`,
      `cómo ${niche}`,
      `${niche} desde cero`,
      `${niche} para principiantes`,
      `ganar dinero con ${niche}`,
      `tutorial ${niche}`,
    ],
    thumbnailConcept: `Fondo oscuro/negro. Texto grande: "${title.slice(0, 30).toUpperCase()}". ${isNoFace ? "Imagen de stock llamativa relacionada al tema." : "Foto tuya con expresión sorprendida/emocionada."} Flecha o círculo rojo señalando el elemento clave. Colores: rojo + amarillo para máximo CTR.`,
  };
}
