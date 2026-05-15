import { createClient } from "@supabase/supabase-js";
import { getSupabaseAnonKey, getSupabaseUrl } from "./env";

/** Server-only. Never expose service role to the browser. */
export function createAdminClient() {
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!serviceRole) {
    return null;
  }

  return createClient(getSupabaseUrl(), serviceRole, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
