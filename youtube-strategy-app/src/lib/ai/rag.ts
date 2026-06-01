// Motor RAG — Retrieval-Augmented Generation
// Pipeline: query → embedding → búsqueda coseno → contexto → LLM

import { prisma } from "@/lib/db/prisma";
import { generateEmbedding } from "@/lib/ai/embeddings";
import type { KnowledgeChunk, MentorSource } from "@/types/ai";

const TOP_K = 5;

export async function retrieveContext(
  query: string,
  authorFilter?: MentorSource
): Promise<KnowledgeChunk[]> {
  // Si no hay pgvector configurado, devolver chunks mock
  if (!process.env.DATABASE_URL) {
    return getMockChunks(query);
  }

  try {
    const queryEmbedding = await generateEmbedding(query);
    const embeddingStr = `[${queryEmbedding.join(",")}]`;

    // Raw query para usar la operación coseno de pgvector
    const chunks = await prisma.$queryRaw<
      Array<{
        id: string;
        source_type: string;
        source_id: string | null;
        author: string | null;
        chunk_text: string;
        metadata: unknown;
        similarity: number;
      }>
    >`
      SELECT id, source_type, source_id, author, chunk_text, metadata,
             1 - (embedding <=> ${embeddingStr}::vector) AS similarity
      FROM knowledge_embeddings
      ${authorFilter ? `WHERE author = ${authorFilter}` : ""}
      ORDER BY embedding <=> ${embeddingStr}::vector
      LIMIT ${TOP_K}
    `;

    return chunks.map((c) => ({
      id: c.id,
      sourceType: c.source_type as KnowledgeChunk["sourceType"],
      sourceId: c.source_id,
      author: c.author as MentorSource | null,
      chunkText: c.chunk_text,
      similarity: c.similarity,
    }));
  } catch {
    return getMockChunks(query);
  }
}

export function buildRAGPrompt(
  systemPrompt: string,
  chunks: KnowledgeChunk[],
  userQuery: string
): string {
  const contextSection = chunks
    .map(
      (c, i) =>
        `[Fuente ${i + 1} — ${c.author ?? "desconocido"}]: ${c.chunkText}`
    )
    .join("\n\n");

  return `${systemPrompt}

--- CONTEXTO DE BASE DE CONOCIMIENTO ---
${contextSection}
--- FIN DEL CONTEXTO ---

Usá el contexto anterior para fundamentar tu respuesta.`;
}

// Mock chunks para desarrollo sin DB
function getMockChunks(query: string): KnowledgeChunk[] {
  const chunks: KnowledgeChunk[] = [
    {
      id: "mock-1",
      sourceType: "methodology" as const,
      sourceId: null,
      author: "adrian_saenz" as const,
      chunkText:
        "El proceso de 5 pasos de Adrián Sáenz: Nicho → Tipo de contenido → Packaging → Producción con IA → Monetización. Las métricas que importan: CTR >4% y Retención >50%.",
      similarity: 0.9,
    },
    {
      id: "mock-2",
      sourceType: "methodology" as const,
      sourceId: null,
      author: "alex_hormozi" as const,
      chunkText:
        "Alex Hormozi: Diseñá la oferta ANTES del canal. El contenido son anuncios gratuitos. Value Equation: (Resultado soñado × Probabilidad percibida) / (Tiempo × Esfuerzo).",
      similarity: 0.85,
    },
    {
      id: "mock-3",
      sourceType: "methodology" as const,
      sourceId: null,
      author: "mrbeast" as const,
      chunkText:
        "MrBeast: El thumbnail es el 80% del éxito. Outlier Test: buscá videos con 10x el promedio del canal. Si existen, el nicho funciona.",
      similarity: 0.8,
    },
  ];
  return chunks.filter((c) =>
    query.length > 0 ? true : (c.similarity ?? 0) > 0.7
  );
}
