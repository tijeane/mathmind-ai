"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Branded fallback when a route segment throws. Uses `retry` (Next 16.3+)
 * so "Try again" re-fetches server data instead of only clearing client state.
 */
export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">MathMind</p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Something went wrong
        </h1>
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          We hit an unexpected error. You can try again, or head back to your dashboard.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => retry()}
          className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-300 px-6 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
