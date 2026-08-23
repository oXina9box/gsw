export type ContactState = { success?: boolean; error?: string; message?: string; retryAfterSeconds?: number };
const rateLimits = new Map<string, { count: number; resetAt: number }>();
export const CONTACT_RATE_LIMIT_MAX = 10;
export const CONTACT_RATE_LIMIT_WINDOW_MS = 3600_000;

function getRateLimitState(ip: string, now: number) {
  const record = rateLimits.get(ip);
  if (!record || record.resetAt <= now) return null;
  return record;
}

export function checkContactRateLimit(ip: string, now = Date.now()): { allowed: boolean; retryAfterSeconds?: number } {
  const record = getRateLimitState(ip, now);
  if (!record) return { allowed: true };
  if (record.count >= CONTACT_RATE_LIMIT_MAX) {
    return { allowed: false, retryAfterSeconds: Math.ceil((record.resetAt - now) / 1000) };
  }
  return { allowed: true };
}

export function recordContactAttempt(ip: string, now = Date.now()): number | null {
  const record = getRateLimitState(ip, now);
  if (record) {
    if (record.count >= CONTACT_RATE_LIMIT_MAX) {
      return Math.ceil((record.resetAt - now) / 1000);
    }
    record.count += 1;
    return null;
  }
  rateLimits.set(ip, { count: 1, resetAt: now + CONTACT_RATE_LIMIT_WINDOW_MS });
  return null;
}

export function __resetContactRateLimits() {
  rateLimits.clear();
}
export function __setContactRateLimit(ip: string, count: number, resetAt: number) {
  rateLimits.set(ip, { count, resetAt });
}

// ponytail: global interval, per-IP sweep if scale matters
const __contactSweep = setInterval(() => {
  const n = Date.now();
  for (const [k, v] of rateLimits) if (v.resetAt <= n) rateLimits.delete(k);
}, 600_000);
if (typeof __contactSweep.unref === "function") __contactSweep.unref();
