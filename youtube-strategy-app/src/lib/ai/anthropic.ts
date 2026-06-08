// Anthropic client — server-side only, called via API routes.

import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 4096;

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ─── Return types ─────────────────────────────────────────────

export interface GeneratedTitle {
  title: string;
  ctrScore: number;
  tags: string[];
  improvements: string[];
}

export interface GeneratedScript {
  hook: string;
  intro: string;
  body: string[];
  cta: string;
  totalWords: number;
  estimatedDuration: string;
}

export interface GeneratedSEO {
  title: string;
  description: string;
  tags: string[];
  keywords: string[];
  hashtags: string[];
}

export interface ThumbnailConcept {
  mainText: string;
  visualElements: string[];
  colorScheme: string;
  emotion: string;
  layout: string;
  ctaText?: string;
}

export interface TrendAnalysis {
  trendingNow: string[];
  risingTopics: string[];
  blueOceans: string[];
  aiIdeas: string[];
  summary: string;
}

export interface VideoScore {
  total: number;
  breakdown: {
    title: number;
    thumbnail: number;
    content: number;
    seo: number;
    nicheFit: number;
  };
  recommendations: string[];
}

// ─── Helpers ──────────────────────────────────────────────────

function extractText(response: Anthropic.Message): string {
  const block = response.content[0];
  return block.type === "text" ? block.text : "";
}

function parseJSON<T>(raw: string, fallback: T): T {
  try {
    const match = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    return JSON.parse(match ? match[1] : raw) as T;
  } catch {
    return fallback;
  }
}

// ─── Functions ────────────────────────────────────────────────

export async function generateTitles(
  topic: string,
  niche: string,
  style: string,
  count = 10
): Promise<GeneratedTitle[]> {
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        {
          role: "user",
          content: `Generate ${count} YouTube video titles for:
Topic: ${topic}
Niche: ${niche}
Style: ${style}

For each title provide a CTR score (1-100), 5-8 tags, and 2-3 improvement suggestions.

Respond ONLY with valid JSON:
{
  "titles": [
    {
      "title": "string",
      "ctrScore": number,
      "tags": ["string"],
      "improvements": ["string"]
    }
  ]
}`,
        },
      ],
    });

    const data = parseJSON<{ titles: GeneratedTitle[] }>(
      extractText(response),
      { titles: [] }
    );
    return data.titles;
  } catch (err) {
    console.error("[Anthropic] generateTitles error:", err);
    return [];
  }
}

export async function generateScript(
  topic: string,
  niche: string,
  style: string,
  duration: string
): Promise<GeneratedScript | null> {
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        {
          role: "user",
          content: `Write a YouTube script for:
Topic: ${topic}
Niche: ${niche}
Style: ${style}
Target duration: ${duration}

Respond ONLY with valid JSON:
{
  "hook": "string (first 30s — attention grabber)",
  "intro": "string (what viewers will learn)",
  "body": ["string (section 1)", "string (section 2)", "string (section 3)"],
  "cta": "string (call to action)",
  "totalWords": number,
  "estimatedDuration": "string (e.g. 8-10 minutes)"
}`,
        },
      ],
    });

    return parseJSON<GeneratedScript | null>(extractText(response), null);
  } catch (err) {
    console.error("[Anthropic] generateScript error:", err);
    return null;
  }
}

export async function generateSEO(
  title: string,
  topic: string,
  niche: string
): Promise<GeneratedSEO | null> {
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        {
          role: "user",
          content: `Generate YouTube SEO optimization for:
Title: ${title}
Topic: ${topic}
Niche: ${niche}

Respond ONLY with valid JSON:
{
  "title": "string (SEO title, max 60 chars)",
  "description": "string (200-300 words with keywords)",
  "tags": ["string (20-30 specific tags)"],
  "keywords": ["string (10-15 primary keywords)"],
  "hashtags": ["string (5 trending hashtags without #)"]
}`,
        },
      ],
    });

    return parseJSON<GeneratedSEO | null>(extractText(response), null);
  } catch (err) {
    console.error("[Anthropic] generateSEO error:", err);
    return null;
  }
}

export async function generateThumbnailConcept(
  topic: string,
  niche: string,
  title: string
): Promise<ThumbnailConcept | null> {
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        {
          role: "user",
          content: `Design a high-CTR thumbnail concept for:
Topic: ${topic}
Niche: ${niche}
Title: ${title}

Respond ONLY with valid JSON:
{
  "mainText": "string (bold overlay text, max 5 words)",
  "visualElements": ["string"],
  "colorScheme": "string (palette description)",
  "emotion": "string (curiosity/shock/desire/fear/urgency)",
  "layout": "string (composition description)",
  "ctaText": "string (optional secondary text)"
}`,
        },
      ],
    });

    return parseJSON<ThumbnailConcept | null>(extractText(response), null);
  } catch (err) {
    console.error("[Anthropic] generateThumbnailConcept error:", err);
    return null;
  }
}

export async function detectTrends(
  nicheData: string,
  searchResults: string
): Promise<TrendAnalysis | null> {
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        {
          role: "user",
          content: `Analyze YouTube trends from this data:

Niche Context:
${nicheData}

Search / Trending Data:
${searchResults}

Respond ONLY with valid JSON:
{
  "trendingNow": ["string"],
  "risingTopics": ["string (gaining momentum in 30-90 days)"],
  "blueOceans": ["string (underserved topics with high potential)"],
  "aiIdeas": ["string (video ideas based on detected trends)"],
  "summary": "string (2-3 sentence overview)"
}`,
        },
      ],
    });

    return parseJSON<TrendAnalysis | null>(extractText(response), null);
  } catch (err) {
    console.error("[Anthropic] detectTrends error:", err);
    return null;
  }
}

export async function scoreVideoIdea(
  title: string,
  thumbnail: string,
  script: string,
  nicheData: string
): Promise<VideoScore | null> {
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        {
          role: "user",
          content: `Score this YouTube video idea (1-100):

Title: ${title}
Thumbnail concept: ${thumbnail}
Script summary: ${script}
Niche context: ${nicheData}

Score 5 dimensions:
- title: CTR potential, clarity, hooks
- thumbnail: visual impact, curiosity gap
- content: value, structure, engagement
- seo: keywords, discoverability
- nicheFit: relevance, competition, timing

Total = weighted average of the 5 scores.

Respond ONLY with valid JSON:
{
  "total": number,
  "breakdown": {
    "title": number,
    "thumbnail": number,
    "content": number,
    "seo": number,
    "nicheFit": number
  },
  "recommendations": ["string (specific actionable improvements)"]
}`,
        },
      ],
    });

    return parseJSON<VideoScore | null>(extractText(response), null);
  } catch (err) {
    console.error("[Anthropic] scoreVideoIdea error:", err);
    return null;
  }
}
