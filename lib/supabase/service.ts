import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Privileged Supabase client using the service role key. This BYPASSES
 * Row-Level Security (ADR-006). Use only for trusted server-side operations
 * that explicitly need to act outside a user's own security context
 * (e.g. system jobs, admin tooling). Never expose this client or the
 * service role key to the browser.
 *
 * The `server-only` import ensures this module cannot be accidentally
 * bundled into client-side code.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. " +
        "Copy .env.example to .env.local and fill in your Supabase project values.",
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
