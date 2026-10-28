/**
 * Minimal in-memory limiter: 5 submissions per IP per hour.
 * On serverless each instance has its own memory, so this only slows down
 * casual abuse. Swap for Upstash Redis or a WAF rule when real traffic arrives.
 */
const WINDOW_MS = 60 * 60 * 1000;
const MAX = 5;
const hits = new Map<string, number[]>();

export function allow(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return true;
}
