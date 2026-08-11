import Link from "next/link";
import { BrandMark } from "@/components/layout/BrandMark";
import { SignOutButton } from "@/components/layout/SignOutButton";

/**
 * Shared app chrome: brand mark, optional display name, and sign-out.
 * Contextual back links stay on their pages.
 */
export function AppHeader({ displayName }: { displayName: string | null }) {
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-6 py-4">
        <Link
          href={displayName ? "/dashboard" : "/"}
          className="flex items-center gap-2"
        >
          <BrandMark />
          <span className="text-base font-semibold tracking-tight text-foreground">MathMind</span>
        </Link>
        {displayName ? (
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-foreground-muted sm:inline">{displayName}</span>
            <SignOutButton />
          </div>
        ) : null}
      </div>
    </header>
  );
}
