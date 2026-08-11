import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/layout/SignOutButton";

/**
 * Thin app chrome shared across routes: brand mark plus sign-out when
 * authenticated. Contextual back links (course ↔ practice) stay on their
 * pages; this only solves "where am I / how do I leave".
 */
export async function AppHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex h-14 w-full max-w-2xl items-center justify-between px-6">
        <Link
          href={user ? "/dashboard" : "/"}
          className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-zinc-50"
        >
          MathMind
        </Link>
        {user ? <SignOutButton /> : null}
      </div>
    </header>
  );
}
