import { headers } from "next/headers";

type Bucket = { count: number; resetAt: number };

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 8;
const buckets = new Map<string, Bucket>();
let callsSinceSweep = 0;

export async function getRequestIp() {
  const h = await headers();
  const forwardedFor = h.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}

export function checkRateLimit(key: string, { windowMs = WINDOW_MS, max = MAX_REQUESTS } = {}, now = Date.now()) {
  if (callsSinceSweep++ > 200) {
    callsSinceSweep = 0;
    for (const [bucketKey, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(bucketKey);
    }
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  if (bucket.count >= max) {
    throw new Error("Too many submissions from this connection. Please wait a few minutes and try again.");
  }
  bucket.count += 1;
}

export function resetRateLimitState() {
  buckets.clear();
  callsSinceSweep = 0;
}

export async function enforceRateLimit(action: string, options: { windowMs?: number; max?: number } = {}) {
  const ip = await getRequestIp();
  checkRateLimit(`${action}:${ip}`, options);
}
