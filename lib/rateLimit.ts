// lib/rateLimit.ts
// super-simple in-memory rate limiter (per key)
const hits: Record<string, number[]> = {};

export function rateLimit(key: string, limit = 20, windowMs = 60_000) {
  const now = Date.now();
  const arr = (hits[key] ||= []);
  // drop old timestamps
  while (arr.length && now - arr[0] > windowMs) arr.shift();
  if (arr.length >= limit) {
    const retryAfter = Math.ceil((windowMs - (now - arr[0])) / 1000);
    return { ok: false, retryAfter };
  }
  arr.push(now);
  return { ok: true, retryAfter: 0 };
}
