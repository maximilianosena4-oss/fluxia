// YouTube Data API v3 — Tipos

export interface YouTubeChannel {
  id: string;
  title: string;
  description: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
  thumbnailUrl: string;
  country: string | null;
  keywords: string[];
  publishedAt: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  channelId: string;
  channelTitle: string;
  thumbnailUrl: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  duration: string;
  publishedAt: string;
  tags: string[];
  topicCategories?: string[];
}

export interface YouTubeSearchResult {
  videos: YouTubeVideo[];
  channels: YouTubeChannel[];
  totalResults: number;
  nextPageToken?: string;
}

export interface OutlierTestResult {
  channelId: string;
  channelTitle: string;
  averageViews: number;
  topVideoViews: number;
  outlierRatio: number;  // topVideo / average — si >10 hay outlier
  hasOutlier: boolean;
  outlierVideos: YouTubeVideo[];
}

export interface NicheAnalysis {
  niche: string;
  language: string;
  topChannels: YouTubeChannel[];
  recentViralVideos: YouTubeVideo[];
  outlierTests: OutlierTestResult[];
  competitionLevel: "LOW" | "MEDIUM" | "HIGH" | "SATURATED";
  activeChannelsCount: number;
  marketDemandIndicators: {
    hasActiveSearches: boolean;
    hasViralVideos: boolean;
    hasSufficientVolume: boolean;
    hasGrowingTrend: boolean;
    hasSuccessCases: boolean;
    hasPositiveProjection: boolean;
  };
}

export interface QuotaStatus {
  used: number;
  limit: number;
  remaining: number;
  resetAt: Date;
  warningThreshold: number; // alert when below this %
}
