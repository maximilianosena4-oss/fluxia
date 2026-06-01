// Tipos del sistema IA / RAG

export type MentorSource =
  | "eloisa_wolf"
  | "adrian_saenz"
  | "eric_alanis"
  | "alex_hormozi"
  | "mrbeast";

export interface KnowledgeChunk {
  id: string;
  sourceType: "youtube_transcript" | "web_article" | "methodology";
  sourceId: string | null;
  author: MentorSource | null;
  chunkText: string;
  similarity?: number; // cosine similarity score from RAG query
}

export interface RAGContext {
  query: string;
  chunks: KnowledgeChunk[];
  systemPrompt: string;
}

export interface ConsultantResponse {
  analysis: string;
  recommendation: string;
  nextAction: string;
  estimatedTime: string;
  tool: string;
  source: {
    mentor: MentorSource;
    concept: string;
  };
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  structuredResponse?: ConsultantResponse;
  sources?: KnowledgeChunk[];
  createdAt: Date;
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  channelId: string;
  messages: ChatMessage[];
  context: {
    nicheScore: number | null;
    roadmapProgress: number;
    lastCompletedActions: string[];
  };
}

export type LLMProvider = "anthropic" | "openai";

export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  temperature: number;
  maxTokens: number;
}

export const DEFAULT_LLM_CONFIG: LLMConfig = {
  provider: "anthropic",
  model: "claude-sonnet-4-6",
  temperature: 0.3,
  maxTokens: 2000,
};

export const CREATIVE_LLM_CONFIG: LLMConfig = {
  provider: "anthropic",
  model: "claude-sonnet-4-6",
  temperature: 0.7,
  maxTokens: 2000,
};
