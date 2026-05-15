import { createAdminClient } from "@/lib/supabase/admin";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

export async function registerUser(
  username: string,
  password: string,
  displayName: string,
): Promise<{ userId: string } | { error: string }> {
  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (existing) return { error: "username_taken" };

  const passwordHash = await hashPassword(password);

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .insert({ username, display_name: displayName })
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
