import { createClient } from "@supabase/supabase-js";
import { getSupabaseUrl } from "./env";

function getServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key || key.includes("your-service")) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY in .env.local (Supabase → Project Settings → API → service_role)",
    );
  }
  return key;
}

export function createAdminClient() {
  return createClient(getSupabaseUrl(), getServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
