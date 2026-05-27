import { createHash, randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";

export type AuthTokenType =
  | "password_reset"
  | "email_verify"
  | "telegram_link";

export function createRawToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function storeAuthToken(
  userId: string,
  type: AuthTokenType,
  ttlMs: number,
): Promise<string> {
  const supabase = createClient();
  const raw = createRawToken();
  const tokenHash = hashToken(raw);
  const expiresAt = new Date(Date.now() + ttlMs).toISOString();

  await supabase
    .from("auth_tokens")
    .delete()
    .eq("user_id", userId)
    .eq("type", type)
    .is("used_at", null);

  const { error } = await supabase.from("auth_tokens").insert({
    user_id: userId,
    type,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });

  if (error) throw new Error(error.message);
  return raw;
}

export async function consumeAuthToken(
  raw: string,
  type: AuthTokenType,
): Promise<string | null> {
  const supabase = createClient();
  const tokenHash = hashToken(raw);
  const now = new Date().toISOString();

  const { data } = await supabase
    .from("auth_tokens")
    .select("id, user_id, expires_at, used_at")
    .eq("token_hash", tokenHash)
    .eq("type", type)
    .maybeSingle();

  if (!data || data.used_at || data.expires_at < now) return null;

  await supabase
    .from("auth_tokens")
    .update({ used_at: now })
    .eq("id", data.id);

  return data.user_id;
}
