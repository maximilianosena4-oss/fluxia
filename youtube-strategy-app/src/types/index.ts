// Tipos compartidos de la aplicación

export type UserPlan = "free" | "pro" | "enterprise";

export interface AppUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  plan: UserPlan;
  createdAt: Date;
  lastActive: Date;
}

export type ChannelStatus = "active" | "paused" | "archived";

export interface Channel {
  id: string;
  userId: string;
  youtubeChannelId: string | null;
  niche: string | null;
  score: number | null;
  status: ChannelStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type ContentStatus = "pending" | "in-progress" | "published" | "archived";
export type ActionPhase = 0 | 1 | 2 | 3;

export interface ActionItem {
  id: string;
  channelId: string;
  phase: ActionPhase;
  step: number;
  description: string;
  dueDate: Date | null;
  completedAt: Date | null;
  createdAt: Date;
}

// Scoring

export interface NicheScoreBreakdown {
  marketDemand: number;       // max 24
  lowCompetition: number;     // max 24
  monetizationRpm: number;    // max 16
  entryBarriers: number;      // max 12
  scalability: number;        // max 12
  aiProduction: number;       // max 8
  total: number;              // max 96
}

export type NicheVerdict = "GO" | "REFINE" | "DISCARD";

export interface NicheEvaluationResult {
  score: NicheScoreBreakdown;
  verdict: NicheVerdict;
  recommendation: string;
  createdAt: Date;
}

// Dashboard metrics

export interface DashboardMetrics {
  nicheScore: number | null;
  videosPublished: number;
  daysToMonetization: number | null;
  projectedRevenue90d: number | null;
  roadmapProgress: number; // 0-100
}

// API responses

export interface ApiSuccess<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  code?: string;
}
