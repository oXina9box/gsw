import { createClient } from "@/lib/supabase/server";

export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number }> {
  const supabase = await createClient();
  const windowStart = new Date(Date.now() - windowMs);

  const { data, error } = await supabase.rpc("check_rate_limit", {
    rate_key: key,
    rate_limit: limit,
    window_start: windowStart.toISOString(),
  });

  if (error) throw new Error(`rate limit check failed: ${error.message}`);
  return data as { allowed: boolean; remaining: number };
}
