/**
 * In-memory rate limiter using a Map<key, { count, resetAt }>.
 *
 * Trade-offs (intentional):
 * - No Redis / no shared state across serverless instances. Each Vercel
 *   function invocation has its own Map. For a single-instance deployment
 *   this gives exact limits; for serverless it gives "per-instance" limits
 *   which is still a meaningful throttle against brute-force / spam.
 * - Entries auto-clean: we sweep expired entries lazily on every call AND
 *   opportunistically once per minute, so memory stays bounded even under
 *   sustained load with rotating keys.
 *
 * API:
 *   rateLimit(key) → default 10 req / 60s
 *   rateLimit(key, 5, 60_000) → 5 req / 60s
 */

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number; // epoch ms when the window resets
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const DEFAULT_LIMIT = 10;
const DEFAULT_WINDOW_MS = 60 * 1000;
const CLEANUP_INTERVAL_MS = 60 * 1000;

const store = new Map<string, RateLimitEntry>();
let lastCleanupAt = Date.now();

function cleanupExpiredEntries(now: number): void {
  if (now - lastCleanupAt < CLEANUP_INTERVAL_MS) return;
  lastCleanupAt = now;
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}

/**
 * Check or increment the rate-limit counter for `key`.
 * Returns `{ success, remaining, resetAt }`. When `success === false`, the
 * caller should respond HTTP 429 with a `Retry-After` header derived from
 * `resetAt`.
 */
export function rateLimit(
  key: string,
  limit: number = DEFAULT_LIMIT,
  windowMs: number = DEFAULT_WINDOW_MS
): RateLimitResult {
  const now = Date.now();
  cleanupExpiredEntries(now);

  const existing = store.get(key);

  // No existing window OR window has expired → start a fresh window.
  if (!existing || existing.resetAt <= now) {
    const entry: RateLimitEntry = { count: 1, resetAt: now + windowMs };
    store.set(key, entry);
    return {
      success: true,
      remaining: limit - 1,
      resetAt: entry.resetAt,
    };
  }

  existing.count += 1;
  const remaining = Math.max(0, limit - existing.count);
  return {
    success: existing.count <= limit,
    remaining,
    resetAt: existing.resetAt,
  };
}

/**
 * Extract a stable client identifier from a Request. Prefers the first IP in
 * `X-Forwarded-For` (set by Vercel's edge layer), falls back to `X-Real-IP`,
 * and finally to 'unknown' so that callers without IP headers still get
 * throttled as a single bucket.
 *
 * Exported so route handlers and tests share the same logic.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}

/** Test-only helper: clear the in-memory store between unit tests. */
export function __resetRateLimitStoreForTesting(): void {
  store.clear();
  lastCleanupAt = Date.now();
}
