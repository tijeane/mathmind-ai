"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Clears the Supabase session and sends the user to /login. Lives in the
 * shared header so every authenticated screen has a way out without
 * clearing cookies manually.
 */
export function SignOutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        setIsSigningOut(false);
        return;
      }

      router.push("/login");
      router.refresh();
    } catch {
      setIsSigningOut(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isSigningOut}
      className="text-sm font-medium text-zinc-600 underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-60 dark:text-zinc-400"
    >
      {isSigningOut ? "Signing out..." : "Sign out"}
    </button>
  );
}
