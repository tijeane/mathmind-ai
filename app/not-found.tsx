import Link from "next/link";

/**
 * Branded 404 so a bad/stale course id stays inside MathMind.
 */
export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <h1 className="text-xl font-semibold text-foreground">Page not found</h1>
      <p className="text-sm text-foreground-muted">
        That page doesn&apos;t exist, or the link might be out of date.
      </p>
      <Link
        href="/dashboard"
        className="mt-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
