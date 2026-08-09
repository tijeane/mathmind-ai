import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/health
 *
 * Verifies the app can reach Supabase using the anon key (RLS-scoped
 * client, per ADR-006). Intended for MM-002 verification and basic
 * uptime checks - not a substitute for real observability (see
 * MM-ARC-001, Observability).
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // auth.getSession() works even before any Identity-domain tables
    // exist (Phase 1), so it's a safe Phase-0-appropriate connectivity
    // check: it confirms the URL/anon key are valid and Supabase Auth
    // is reachable, without depending on schema that doesn't exist yet.
    const { error } = await supabase.auth.getSession();

    if (error) {
      return NextResponse.json({ status: "error", message: error.message }, { status: 503 });
    }

    return NextResponse.json({ status: "ok", supabase: "reachable" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ status: "error", message }, { status: 503 });
  }
}
