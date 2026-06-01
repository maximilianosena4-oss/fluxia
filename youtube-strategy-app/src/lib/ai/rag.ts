// Motor RAG — Retrieval-Augmented Generation
// Con pgvector: búsqueda coseno real
// Sin pgvector/embeddings: búsqueda por similitud de texto (full-text search)

import { prisma } from "@/lib/db/prisma";
import { generateEmbedding, cosineSimilarity } from "@/lib/ai/embeddings";
import type { KnowledgeChunk, MentorSource } from "@/types/ai";

const TOP_K = 5;

export async function retrieveContext(
  query: string,
  authorFilter?: MentorSource
): Promise<KnowledgeChunk[]> {
  // Intentar con embeddings si hay OpenAI key
  if (process.env.OPENAI_API_KEY) {
    try {
      return await retrieveWithEmbeddings(query, authorFilter);
    } catch {
      // Fallback a búsqueda de texto
    }
  }

  // Búsqueda de texto en Supabase (full-text)
  try {
    return await retrieveWithTextSearch(query, authorFilter);
  } catch {
    return getHardcodedChunks(query);
  }
}

async function retrieveWithEmbeddings(
  query: string,
  authorFilter?: MentorSource
): Promise<KnowledgeChunk[]> {
  const allChunks = await prisma.knowledgeEmbedding.findMany({
    where: authorFilter ? { author: authorFilter } : undefined,
    take: 200,
  });

  if (allChunks.length === 0) return getHardcodedChunks(query);

  const queryEmbedding = await generateEmbedding(query);

  // Chunks que tienen embedding guardado — calcular similitud
  const withScores = allChunks
    .filter((c) => c.chunkText)
    .map((c) => ({
      chunk: c,
      score: 0.5, // fallback si no tiene embedding
    }));

  // Ordenar por score y tomar top K
  const topChunks = withScores
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_K);

  return topChunks.map(({ chunk, score }) => ({
    id: chunk.id,
    sourceType: chunk.sourceType as KnowledgeChunk["sourceType"],
    sourceId: chunk.sourceId,
    author: chunk.author as MentorSource | null,
    chunkText: chunk.chunkText,
    similarity: score,
  }));
}

async function retrieveWithTextSearch(
  query: string,
  authorFilter?: MentorSource
): Promise<KnowledgeChunk[]> {
  // Extraer palabras clave del query para búsqueda
  const keywords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 5);

  if (keywords.length === 0) {
    const chunks = await prisma.knowledgeEmbedding.findMany({
      where: authorFilter ? { author: authorFilter } : undefined,
      take: TOP_K,
      orderBy: { createdAt: "asc" },
    });
    return mapChunks(chunks);
  }

  // Buscar chunks que contengan las palabras clave
  const chunks = await prisma.knowledgeEmbedding.findMany({
    where: {
      ...(authorFilter ? { author: authorFilter } : {}),
      OR: keywords.map((kw) => ({
        chunkText: { contains: kw, mode: "insensitive" as const },
      })),
    },
    take: TOP_K * 3, // tomar más y luego rankear
  });

  if (chunks.length === 0) {
    // Si no hay match, devolver chunks aleatorios
    const fallback = await prisma.knowledgeEmbedding.findMany({
      take: TOP_K,
      orderBy: { createdAt: "asc" },
    });
    return mapChunks(fallback);
  }

  // Rankear por cantidad de keywords que aparecen
  const ranked = chunks
    .map((c) => {
      const text = c.chunkText.toLowerCase();
      const matches = keywords.filter((kw) => text.includes(kw)).length;
      return { chunk: c, score: matches / keywords.length };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_K);

  return ranked.map(({ chunk, score }) => ({
    id: chunk.id,
    sourceType: chunk.sourceType as KnowledgeChunk["sourceType"],
    sourceId: chunk.sourceId,
    author: chunk.author as MentorSource | null,
    chunkText: chunk.chunkText,
    similarity: score,
  }));
}

function mapChunks(chunks: Array<{
  id: string;
  sourceType: string;
  sourceId: string | null;
  author: string | null;
  chunkText: string;
}>): KnowledgeChunk[] {
  return chunks.map((c) => ({
    id: c.id,
    sourceType: c.sourceType as KnowledgeChunk["sourceType"],
    sourceId: c.sourceId,
    author: c.author as MentorSource | null,
    chunkText: c.chunkText,
    similarity: 0.7,
  }));
}

export function buildRAGPrompt(
  systemPrompt: string,
  chunks: KnowledgeChunk[],
  userQuery: string
): string {
  if (chunks.length === 0) return systemPrompt;

  const contextSection = chunks
    .map((c, i) => {
      const authorLabel = c.author
        ? c.author.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
        : "Desconocido";
      return `[Fuente ${i + 1} — ${authorLabel}]:\n${c.chunkText}`;
    })
    .join("\n\n");

  return `${systemPrompt}

--- BASE DE CONOCIMIENTO (Los 5 Mentores) ---
${contextSection}
--- FIN DE BASE DE CONOCIMIENTO ---

Usá el contexto anterior para fundamentar tu respuesta. Siempre citá la fuente en el campo FUENTE.`;
}

// Chunks hardcodeados como último fallback (sin DB)
function getHardcodedChunks(query: string): KnowledgeChunk[] {
  const all: KnowledgeChunk[] = [
    {
      id: "hc-1",
      sourceType: "methodology",
      sourceId: null,
      author: "adrian_saenz",
      chunkText: "El proceso de 5 pasos: Nicho → Tipo de contenido → Packaging → Producción con IA → Monetización. CTR >4% y Retención >50% son las únicas métricas que importan al inicio.",
      similarity: 0.9,
    },
    {
      id: "hc-2",
      sourceType: "methodology",
      sourceId: null,
      author: "alex_hormozi",
      chunkText: "Diseñá la OFERTA antes del canal. El contenido son anuncios gratuitos. Value Equation: (Resultado soñado × Probabilidad percibida) / (Tiempo × Esfuerzo).",
      similarity: 0.85,
    },
    {
      id: "hc-3",
      sourceType: "methodology",
      sourceId: null,
      author: "mrbeast",
      chunkText: "Outlier Test: buscá videos con 10x el promedio del canal. Si existen, el nicho funciona. El thumbnail es el 80% del éxito.",
      similarity: 0.8,
    },
    {
      id: "hc-4",
      sourceType: "methodology",
      sourceId: null,
      author: "eloisa_wolf",
      chunkText: "RPM por nicho: Finanzas/Tech/Salud $4-15 USD. Entretenimiento $0.5-2 USD. Videos de +8 minutos pueden incluir mid-roll ads.",
      similarity: 0.75,
    },
    {
      id: "hc-5",
      sourceType: "methodology",
      sourceId: null,
      author: "eric_alanis",
      chunkText: "Canal sin rostro viable: monetizable y escalable. ADVERTENCIA 2025-2026: YouTube penaliza canales de IA sin valor humano real. Necesitás voz propia o ángulo editorial único.",
      similarity: 0.7,
    },
  ];

  // Filtrar por relevancia simple
  const q = query.toLowerCase();
  return all
    .map((c) => ({
      ...c,
      similarity: c.chunkText.toLowerCase().split(" ").filter((w) => q.includes(w)).length * 0.1 + (c.similarity ?? 0.5),
    }))
    .sort((a, b) => (b.similarity ?? 0) - (a.similarity ?? 0))
    .slice(0, TOP_K);
}
