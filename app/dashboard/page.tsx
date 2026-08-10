import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * MM-100: minimal authenticated landing route.
 *
 * This is the redirect target required by MM-100/MM-101's Definition of
 * Done. It intentionally has no course content or role-based UI yet —
 * that is MM-200/MM-104 scope, not this ticket's, per the MVP Execution
 * Rule in IMPLEMENTATION_BACKLOG.md.
 */
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-32 dark:bg-black">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        Welcome back, {user.email}
      </h1>
    </div>
  );
}
