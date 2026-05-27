import { createAdminClient } from "@/lib/supabase/admin";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { normalizeEmail } from "@/lib/auth/email";
import type { TelegramWebAppUser } from "@/lib/auth/telegram";

export async function registerUser(
  username: string,
  password: string,
  displayName: string,
  email?: string | null,
): Promise<{ userId: string } | { error: string }> {
  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (existing) return { error: "username_taken" };

  const normalizedEmail = email ? normalizeEmail(email) : null;

  if (normalizedEmail) {
    const { data: emailTaken } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();
    if (emailTaken) return { error: "email_taken" };
  }

  const passwordHash = await hashPassword(password);

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .insert({
      username,
      display_name: displayName,
      email: normalizedEmail,
      email_verified_at: null,
    })
    .select("id")
    .single();

  if (profileError || !profile) {
    return { error: profileError?.message ?? "profile_create_failed" };
  }

  const { error: credError } = await supabase
    .from("account_credentials")
    .insert({ user_id: profile.id, password_hash: passwordHash });

  if (credError) {
    await supabase.from("profiles").delete().eq("id", profile.id);
    return { error: credError.message };
  }

  return { userId: profile.id };
}

export async function verifyUserLogin(
  username: string,
  password: string,
): Promise<string | null> {
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (!profile) return null;

  const { data: cred } = await supabase
    .from("account_credentials")
    .select("password_hash")
    .eq("user_id", profile.id)
    .maybeSingle();

  if (!cred?.password_hash) return null;

  const ok = await verifyPassword(password, cred.password_hash);
  return ok ? profile.id : null;
}

export async function updateUserPassword(userId: string, password: string) {
  const supabase = createAdminClient();
  const passwordHash = await hashPassword(password);

  const { error } = await supabase
    .from("account_credentials")
    .update({ password_hash: passwordHash })
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}

export async function getProfileByVerifiedEmail(email: string) {
  const supabase = createAdminClient();
  const normalized = normalizeEmail(email);

  const { data } = await supabase
    .from("profiles")
    .select("id, username, email, email_verified_at")
    .eq("email", normalized)
    .not("email_verified_at", "is", null)
    .maybeSingle();

  return data;
}

export async function getProfileByEmail(email: string) {
  const supabase = createAdminClient();
  const normalized = normalizeEmail(email);

  const { data } = await supabase
    .from("profiles")
    .select("id, username, email, email_verified_at")
    .eq("email", normalized)
    .maybeSingle();

  return data;
}

function buildDisplayName(user: TelegramWebAppUser): string {
  const parts = [user.first_name, user.last_name].filter(Boolean);
  return parts.join(" ").trim() || user.first_name;
}

function sanitizeTelegramUsername(user: TelegramWebAppUser): string {
  const raw = user.username?.toLowerCase().replace(/[^a-z0-9_]/g, "") ?? "";
  if (raw.length >= 3 && raw.length <= 24) return raw;
  return `tg_${user.id}`;
}

async function pickUniqueUsername(
  supabase: ReturnType<typeof createAdminClient>,
  base: string,
): Promise<string> {
  let candidate = base.slice(0, 24);
  let suffix = 0;

  while (suffix < 100) {
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", candidate)
      .maybeSingle();

    if (!data) return candidate;

    suffix += 1;
    const tail = `_${suffix}`;
    candidate = `${base.slice(0, 24 - tail.length)}${tail}`;
  }

  return `tg_${Date.now()}`;
}

export async function getProfileByTelegramId(telegramId: number) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, username, telegram_id, telegram_username")
    .eq("telegram_id", telegramId)
    .maybeSingle();

  return data;
}

export async function registerTelegramUser(
  user: TelegramWebAppUser,
): Promise<{ userId: string } | { error: string }> {
  const supabase = createAdminClient();
  const baseUsername = sanitizeTelegramUsername(user);
  const username = await pickUniqueUsername(supabase, baseUsername);
  const now = new Date().toISOString();

  const { data: profile, error } = await supabase
    .from("profiles")
    .insert({
      username,
      display_name: buildDisplayName(user),
      telegram_id: user.id,
      telegram_username: user.username ?? null,
      telegram_linked_at: now,
    })
    .select("id")
    .single();

  if (error || !profile) {
    return { error: error?.message ?? "profile_create_failed" };
  }

  return { userId: profile.id };
}

export async function linkTelegramToProfile(
  userId: string,
  user: TelegramWebAppUser,
): Promise<{ ok: true } | { error: string }> {
  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("profiles")
    .select("id, telegram_id")
    .eq("telegram_id", user.id)
    .maybeSingle();

  if (existing && existing.id !== userId) {
    return { error: "Этот Telegram уже привязан к другому аккаунту" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("telegram_id")
    .eq("id", userId)
    .single();

  if (!profile) return { error: "Профиль не найден" };

  if (profile.telegram_id && profile.telegram_id !== user.id) {
    return { error: "К аккаунту уже привязан другой Telegram" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      telegram_id: user.id,
      telegram_username: user.username ?? null,
      telegram_linked_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) return { error: error.message };
  return { ok: true };
}
