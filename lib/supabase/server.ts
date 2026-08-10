import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client for use on the server (Server Components, Route Handlers,
 * Server Actions). Reads/writes the session via Next.js cookies.
 *
 * Per ADR-006: this is the only approved way to talk to Supabase from
 * server-side code that should run in the user's own security context
 * (i.e. subject to RLS). For privileged/service-role access, use
 * `lib/supabase/service.ts` instead, and only where explicitly required.
 */
export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Copy .env.example to .env.local and fill in your Supabase project values.",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions (see lib/supabase/middleware.ts + proxy.ts).
        }
      },
    },
  });
}

/**
 * MM-104: reads the current user's role from `profiles`, subject to RLS
 * (the "select_own_profile" policy means this can only ever return the
 * caller's own role, never another user's). Returns null if there is no
 * logged-in user or the row/column can't be read.
 */
export async function getUserRole(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  if (error || !data) {
    return null;
  }

  return data.role;
}
