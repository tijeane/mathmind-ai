import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/auth/LoginForm";

/**
 * MM-100: Login page.
 *
 * An already-authenticated user visiting /login is sent straight to
 * /dashboard rather than shown the form again.
 */
export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-32">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Sign in to MathMind</h1>
        <LoginForm />
        <p className="text-sm text-foreground-muted">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-primary underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
