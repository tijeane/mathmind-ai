import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth session on every request. Required because
 * Server Components cannot write cookies (see lib/supabase/server.ts) -
 * this middleware is what keeps the session alive between requests.
 *
 * Full RBAC/route-protection logic belongs in Phase 1 (Identity &
 * Authentication), once the users/roles schema exists. This function only
 * handles session refresh for now.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    // Env not configured yet (e.g. first run before MM-002 credentials are
    // filled in) - skip session refresh rather than crashing every request.
    return supabaseResponse;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  // Do not remove: this refreshes the session and must be called before
  // any Server Component runs, per Supabase's documented pattern.
  await supabase.auth.getUser();

  return supabaseResponse;
}
