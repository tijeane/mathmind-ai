import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Front door for the bare domain. Authenticated visitors go to the
 * dashboard; everyone else sees a minimal MathMind entry point.
 */
export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-8 px-6 py-24 text-center">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">MathMind</h1>
        <p className="text-base leading-7 text-foreground-muted">
          Practice math with an AI tutor that explains the reasoning — not just the answer.
        </p>
      </div>
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/login"
          className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          Sign in
        </Link>
        <Link
          href="/register"
          className="inline-flex h-11 items-center justify-center rounded-full border border-line px-6 text-sm font-medium text-foreground transition-colors hover:bg-surface"
        >
          Create account
        </Link>
      </div>
    </div>
  );
}
