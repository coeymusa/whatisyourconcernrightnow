// Lightweight in-memory rate limiter used as a fallback when Supabase is
// unavailable. Per-IP-hash sliding window, hourly cap.
const HITS = new Map<string, number[]>();

export function rateLimitOk(ipHash: string, max = 5, windowMs = 60 * 60 * 1000): boolean {
  const now = Date.now();
  const arr = (HITS.get(ipHash) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= max) {
    HITS.set(ipHash, arr);
    return false;
  }
  arr.push(now);
  HITS.set(ipHash, arr);
  return true;
}

export async function hashIp(ip: string): Promise<string> {
  const salt = process.env.IP_HASH_SALT ?? "default-salt";
  // Web Crypto SHA-256 (available in Node 20+ and Edge runtimes)
  const data = new TextEncoder().encode(`${salt}:${ip}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
