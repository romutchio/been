import { createAdminClient } from "./admin";

/** Server-only Supabase client (service role). Access control in app code. */
export function createClient() {
  return createAdminClient();
}
