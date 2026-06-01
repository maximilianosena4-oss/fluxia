// Generación de embeddings para el motor RAG
// Usa OpenAI text-embedding-3-small (muy barato)
// Si no hay API key, retorna un vector mock

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1536;

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!process.env.OPENAI_API_KEY) {
    return mockEmbedding(text);
  }

  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.slice(0, 8000), // max input length guard
    dimensions: EMBEDDING_DIMENSIONS,
  });

  return response.data[0].embedding;
}

export async function generateBatchEmbeddings(
  texts: string[]
): Promise<number[][]> {
  if (!process.env.OPENAI_API_KEY) {
    return texts.map((t) => mockEmbedding(t));
  }

  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts.map((t) => t.slice(0, 8000)),
    dimensions: EMBEDDING_DIMENSIONS,
  });

  return response.data.map((d) => d.embedding);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Pseudo-embedding for dev/testing — NOT for production RAG
function mockEmbedding(text: string): number[] {
  const embedding = new Array(EMBEDDING_DIMENSIONS).fill(0);
  for (let i = 0; i < text.length && i < EMBEDDING_DIMENSIONS; i++) {
    embedding[i % EMBEDDING_DIMENSIONS] += text.charCodeAt(i) / 1000;
  }
  const norm = Math.sqrt(embedding.reduce((s, x) => s + x * x, 0)) || 1;
  return embedding.map((x) => x / norm);
}
