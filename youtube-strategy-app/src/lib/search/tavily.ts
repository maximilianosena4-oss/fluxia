// Búsqueda web con Tavily API (primaria) — mock si no hay key

export interface WebSearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  publishedDate?: string;
}

export interface WebSearchResponse {
  results: WebSearchResult[];
  query: string;
  answer?: string;
}

export async function webSearch(
  query: string,
  maxResults = 5
): Promise<WebSearchResponse> {
  if (!process.env.TAVILY_API_KEY) {
    return getMockResults(query);
  }

  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.TAVILY_API_KEY}`,
    },
    body: JSON.stringify({
      query,
      max_results: maxResults,
      search_depth: "basic",
      include_answer: true,
    }),
  });

  if (!res.ok) {
    console.error("[Tavily] Search failed:", res.status);
    return getMockResults(query);
  }

  const data = await res.json();
  return {
    query,
    answer: data.answer,
    results: (data.results ?? []).map((r: Record<string, unknown>) => ({
      title: r.title as string,
      url: r.url as string,
      content: r.content as string,
      score: r.score as number,
      publishedDate: r.published_date as string | undefined,
    })),
  };
}

function getMockResults(query: string): WebSearchResponse {
  return {
    query,
    answer: `[MOCK] Resultados de búsqueda para "${query}". Activá TAVILY_API_KEY para resultados reales.`,
    results: Array.from({ length: 3 }, (_, i) => ({
      title: `[MOCK] Resultado ${i + 1} para "${query}"`,
      url: `https://ejemplo.com/${i + 1}`,
      content: `Contenido mock sobre ${query}. En producción esto vendrá de Tavily API.`,
      score: 0.9 - i * 0.1,
    })),
  };
}
