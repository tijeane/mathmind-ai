import Link from "next/link";

/**
 * Branded 404 so a bad/stale course id (or any missing route) stays inside
 * MathMind instead of Next.js's default unstyled not-found screen.
 */
export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">MathMind</p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Page not found
        </h1>
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          That link may be outdated or mistyped. Head back to your courses to keep practicing.
        </p>
      </div>
      <Link
        href="/dashboard"
        className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
