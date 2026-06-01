// Redis client — usa Upstash (serverless) en producción
// y un mock en desarrollo si no hay credenciales

const hasUpstash =
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN;

type RedisClient = {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, options?: { ex?: number }) => Promise<void>;
  del: (key: string) => Promise<void>;
  incr: (key: string) => Promise<number>;
  expire: (key: string, seconds: number) => Promise<void>;
};

// Mock para desarrollo sin Redis
const redisMock: RedisClient = {
  async get() { return null; },
  async set() { /* noop */ },
  async del() { /* noop */ },
  async incr() { return 1; },
  async expire() { /* noop */ },
};

async function createUpstashClient(): Promise<RedisClient> {
  const { Redis } = await import("@upstash/redis");
  const client = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  return {
    get: (key) => client.get<string>(key),
    set: (key, value, opts) =>
      client.set(key, value, opts?.ex ? { ex: opts.ex } : undefined).then(() => undefined),
    del: (key) => client.del(key).then(() => undefined),
    incr: (key) => client.incr(key),
    expire: (key, seconds) => client.expire(key, seconds).then(() => undefined),
  };
}

let _redis: RedisClient | null = null;

export async function getRedis(): Promise<RedisClient> {
  if (!hasUpstash) return redisMock;
  if (!_redis) _redis = await createUpstashClient();
  return _redis;
}

// Cache helpers
export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = await getRedis();
  const value = await redis.get(key);
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return value as unknown as T;
  }
}

export async function cacheSet<T>(
  key: string,
  value: T,
  ttlSeconds = 3600
): Promise<void> {
  const redis = await getRedis();
  await redis.set(key, JSON.stringify(value), { ex: ttlSeconds });
}

export async function cacheDel(key: string): Promise<void> {
  const redis = await getRedis();
  await redis.del(key);
}
