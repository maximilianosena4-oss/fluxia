// Rate limiting — Upstash Ratelimit cuando disponible, mock cuando no.
// Límites según brief (Sección 7 — A8):
//   IA:          20 req/min por usuario
//   YouTube API: 10 req/min por usuario
//   Auth:         5 req/min por IP
//   Global:    1000 req/min por IP

import { getRedis } from "@/lib/db/redis";

export type RateLimitRoute = "ai" | "youtube" | "auth" | "global";

const LIMITS: Record<RateLimitRoute, { requests: number; windowSeconds: number }> = {
  ai:       { requests: 20,   windowSeconds: 60 },
  youtube:  { requests: 10,   windowSeconds: 60 },
  auth:     { requests: 5,    windowSeconds: 60 },
  global:   { requests: 1000, windowSeconds: 60 },
};

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: Date;
}

export async function checkRateLimit(
  identifier: string,
  route: RateLimitRoute
): Promise<RateLimitResult> {
  const redis = await getRedis();
  const limit = LIMITS[route];
  const key = `rl:${route}:${identifier}`;
  const now = Date.now();
  const windowMs = limit.windowSeconds * 1000;
  const resetAt = new Date(Math.ceil(now / windowMs) * windowMs);

  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, limit.windowSeconds);
  }

  if (count > limit.requests) {
    return { success: false, remaining: 0, resetAt };
  }

  return {
    success: true,
    remaining: limit.requests - count,
    resetAt,
  };
}

export function rateLimitHeaders(result: RateLimitResult, route: RateLimitRoute): Record<string, string> {
  return {
    "X-RateLimit-Limit": LIMITS[route].requests.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": result.resetAt.toISOString(),
  };
}
