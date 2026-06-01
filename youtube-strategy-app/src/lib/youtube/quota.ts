// Monitor de cuota YouTube Data API v3
// Cuota diaria gratuita: 10,000 unidades — alerta cuando queda <20%

import { cacheGet, cacheSet } from "@/lib/db/redis";

const DAILY_QUOTA = 10_000;
const QUOTA_KEY = "yt:quota:used";
const WARNING_THRESHOLD = 0.2; // 20%

// Costos por operación (unidades)
export const QUOTA_COSTS = {
  search: 100,
  videos: 1,
  channels: 1,
  captions: 50,
  commentThreads: 1,
} as const;

export type QuotaOperation = keyof typeof QUOTA_COSTS;

export async function consumeQuota(operation: QuotaOperation): Promise<{
  allowed: boolean;
  used: number;
  remaining: number;
}> {
  const cost = QUOTA_COSTS[operation];
  const current = (await cacheGet<number>(QUOTA_KEY)) ?? 0;
  const newUsed = current + cost;

  if (newUsed > DAILY_QUOTA) {
    return { allowed: false, used: current, remaining: DAILY_QUOTA - current };
  }

  // TTL hasta medianoche (reset diario)
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const ttl = Math.floor((midnight.getTime() - now.getTime()) / 1000);

  await cacheSet(QUOTA_KEY, newUsed, ttl);

  const remaining = DAILY_QUOTA - newUsed;

  if (remaining / DAILY_QUOTA < WARNING_THRESHOLD) {
    console.warn(`[YouTube Quota] ADVERTENCIA: solo quedan ${remaining} unidades (${Math.round(remaining / DAILY_QUOTA * 100)}%)`);
  }

  return { allowed: true, used: newUsed, remaining };
}

export async function getQuotaStatus() {
  const used = (await cacheGet<number>(QUOTA_KEY)) ?? 0;
  const remaining = DAILY_QUOTA - used;
  const now = new Date();
  const resetAt = new Date(now);
  resetAt.setHours(24, 0, 0, 0);

  return {
    used,
    limit: DAILY_QUOTA,
    remaining,
    resetAt,
    warningThreshold: WARNING_THRESHOLD,
    isWarning: remaining / DAILY_QUOTA < WARNING_THRESHOLD,
  };
}
