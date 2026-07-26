import "server-only";

/**
 * In-process per-user download URL rate limiting.
 *
 * Production recommendation: replace with a shared store (Redis / Upstash /
 * Supabase) so limits apply across all server instances and survive restarts.
 */

const COOLDOWN_MS = 3_000;
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;

type RateLimitEntry = {
  timestamps: number[];
};

const rateLimitStore = new Map<string, RateLimitEntry>();

export type DownloadRateLimitResult = {
  allowed: boolean;
  retryAfterMs?: number;
};

export function checkDownloadRateLimit(
  userId: string,
  now = Date.now(),
): DownloadRateLimitResult {
  const entry = rateLimitStore.get(userId) ?? { timestamps: [] };
  const recent = entry.timestamps.filter(
    (timestamp) => now - timestamp < WINDOW_MS,
  );

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    const oldest = recent[0] ?? now;

    return {
      allowed: false,
      retryAfterMs: Math.max(WINDOW_MS - (now - oldest), 1_000),
    };
  }

  const lastRequest = recent[recent.length - 1];

  if (lastRequest && now - lastRequest < COOLDOWN_MS) {
    return {
      allowed: false,
      retryAfterMs: Math.max(COOLDOWN_MS - (now - lastRequest), 500),
    };
  }

  recent.push(now);
  rateLimitStore.set(userId, { timestamps: recent });

  return { allowed: true };
}

export function resetDownloadRateLimitForTests(userId?: string) {
  if (userId) {
    rateLimitStore.delete(userId);
    return;
  }

  rateLimitStore.clear();
}

export const DOWNLOAD_RATE_LIMIT_NOTES = {
  cooldownMs: COOLDOWN_MS,
  windowMs: WINDOW_MS,
  maxRequestsPerWindow: MAX_REQUESTS_PER_WINDOW,
  productionRecommendation:
    "Use a distributed rate limiter (Redis/Upstash) keyed by auth user ID for multi-instance deployments.",
};
