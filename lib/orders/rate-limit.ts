import "server-only";

type RateLimitEntry = {
  timestamps: number[];
};

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 30;

const rateLimitStore = new Map<string, RateLimitEntry>();

export function checkOrderStatusRateLimit(
  key: string,
  now = Date.now(),
): { allowed: boolean; retryAfterMs?: number } {
  const entry = rateLimitStore.get(key) ?? { timestamps: [] };
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

  recent.push(now);
  rateLimitStore.set(key, { timestamps: recent });

  return { allowed: true };
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");

  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function getOrderStatusRateLimitKey(request: Request): string {
  return getClientIp(request);
}
