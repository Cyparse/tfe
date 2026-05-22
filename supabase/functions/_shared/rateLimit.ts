/**
 * Rate limiter backed by Supabase (service-role key required).
 * One row per request; counts rows in a sliding time window per key.
 * Old rows are cleaned up periodically to keep the table small.
 *
 * Required table (run once in Supabase SQL Editor):
 *
 *   CREATE TABLE IF NOT EXISTS public.rate_limits (
 *     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *     key TEXT NOT NULL,
 *     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
 *   );
 *   CREATE INDEX IF NOT EXISTS idx_rate_limits_key_time
 *     ON public.rate_limits (key, created_at);
 *   ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
 */

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const headers = {
  Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
  apikey: SUPABASE_SERVICE_KEY,
  'Content-Type': 'application/json',
}

/**
 * Returns true if the request is allowed, false if rate limit exceeded.
 *
 * @param key            Unique identifier (e.g. email address)
 * @param limit          Max requests allowed in the window
 * @param windowSeconds  Window duration in seconds (default 3600 = 1 h)
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds = 3600,
): Promise<boolean> {
  try {
    const windowStart = new Date(Date.now() - windowSeconds * 1000).toISOString()

    // Delete rows older than the window (fire-and-forget, 1 in 10 calls)
    if (Math.random() < 0.1) {
      fetch(`${SUPABASE_URL}/rest/v1/rate_limits?created_at=lt.${windowStart}`, {
        method: 'DELETE',
        headers,
      }).catch(() => {})
    }

    // Count existing requests in the window for this key
    const countRes = await fetch(
      `${SUPABASE_URL}/rest/v1/rate_limits?key=eq.${encodeURIComponent(key)}&created_at=gte.${windowStart}&select=id`,
      { method: 'GET', headers: { ...headers, Prefer: 'count=exact' } },
    )

    if (!countRes.ok) return true // fail open on DB error

    const contentRange = countRes.headers.get('Content-Range') // e.g. "0-4/5"
    const count = contentRange ? parseInt(contentRange.split('/')[1] ?? '0', 10) : 0

    if (count >= limit) return false

    // Record this request
    await fetch(`${SUPABASE_URL}/rest/v1/rate_limits`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'return=minimal' },
      body: JSON.stringify({ key }),
    })

    return true
  } catch {
    return true // fail open: never block legit users on unexpected errors
  }
}
