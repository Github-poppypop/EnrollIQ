// lib/utils/rate-limit.ts
// Simple in-memory token bucket rate limiter for Next.js edge/serverless runtime.

interface Bucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, Bucket>();

/**
 * Token-bucket rate limiter.
 *
 * Each key (e.g. IP address) gets `capacity` tokens that refill at
 * `refillRate` tokens per second.  When tokens are exhausted the caller
 * receives `retryAfter` seconds until the next token is available.
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
}

export interface RateLimitOptions {
  /** Maximum tokens in the bucket (burst size). */
  capacity: number;
  /** Tokens refilled per second (sustained rate). */
  refillRate: number;
  /** Per-key limit key (e.g. IP). */
  key: string;
}

const DEFAULT_CAPACITY = 10;
const DEFAULT_REFILL_RATE = 2; // tokens per second

export function checkRateLimit(options: RateLimitOptions): RateLimitResult {
  const { capacity = DEFAULT_CAPACITY, refillRate = DEFAULT_REFILL_RATE, key } = options;
  const now = Date.now();

  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { tokens: capacity, lastRefill: now };
    buckets.set(key, bucket);
  }

  // Refill tokens based on elapsed time
  const elapsed = (now - bucket.lastRefill) / 1000;
  bucket.tokens = Math.min(capacity, bucket.tokens + elapsed * refillRate);
  bucket.lastRefill = now;

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return { allowed: true, remaining: Math.floor(bucket.tokens), retryAfter: 0 };
  }

  const retryAfter = Math.ceil((1 - bucket.tokens) / refillRate);
  return { allowed: false, remaining: 0, retryAfter };
}

/**
 * In-memory cleanup for testing / dev; not needed in production
 * (buckets are per-invocation in serverless, so they're naturally ephemeral).
 */
export function resetRateLimits(): void {
  buckets.clear();
}
