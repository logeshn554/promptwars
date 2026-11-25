interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();
const MAX_STORE_SIZE = 1000;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

function pruneExpired(now: number): void {
  if (store.size < MAX_STORE_SIZE) return;
  for (const [k, entry] of store.entries()) {
    if (now > entry.resetAt) {
      store.delete(k);
    }
  }
}

/**
 * In-memory sliding-window rate limiter per client key with automatic pruning.
 */
export function checkRateLimit(
  key: string,
  limit = 20,
  windowMs = 60_000
): RateLimitResult {
  const now = Date.now();
  pruneExpired(now);

  const existing = store.get(key);

  if (!existing || now > existing.resetAt) {
    const entry: RateLimitEntry = { count: 1, resetAt: now + windowMs };
    store.set(key, entry);
    return { allowed: true, remaining: limit - 1, resetAt: entry.resetAt };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: Math.max(0, limit - existing.count),
    resetAt: existing.resetAt,
  };
}

export function clearRateLimitStore(): void {
  store.clear();
}
