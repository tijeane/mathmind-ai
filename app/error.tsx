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
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <h1 className="text-xl font-semibold text-foreground">Something went wrong</h1>
      <p className="text-sm text-foreground-muted">
        That&apos;s on us, not you. Try again, or head back to your dashboard.
      </p>
      <div className="mt-2 flex gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
