import { createClient } from "@/lib/supabase/server";

type RateLimitResult = { ok: true } | { ok: false; message: string };

export async function checkRateLimit(
  action: string,
  identifier: string,
  maxAttempts: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const supabase = createClient();
  const since = new Date(Date.now() - windowMs).toISOString();

  const { count, error } = await supabase
    .from("rate_limit_log")
    .select("*", { count: "exact", head: true })
    .eq("action", action)
    .eq("identifier", identifier)
    .gte("created_at", since);

  if (error) {
    console.error("rate_limit check failed", error.message);
    return { ok: true };
  }

  if ((count ?? 0) >= maxAttempts) {
    return {
      ok: false,
      message: "Слишком много попыток. Попробуй позже.",
    };
  }

  await supabase.from("rate_limit_log").insert({
    action,
    identifier,
  });

  return { ok: true };
}
