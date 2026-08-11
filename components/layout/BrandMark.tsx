/**
 * MathMind mark: a circle divided into two halves — the same shape a
 * student sees in fraction exercises. Used once in the app header.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width="24"
      height="24"
      className={className}
      role="img"
      aria-label="MathMind"
    >
      <circle cx="16" cy="16" r="15" fill="var(--accent)" />
      <path d="M16 1 A15 15 0 0 1 16 31 Z" fill="var(--primary)" />
      <circle cx="16" cy="16" r="15" fill="none" stroke="var(--surface)" strokeWidth="1.5" />
      <line x1="16" y1="1" x2="16" y2="31" stroke="var(--surface)" strokeWidth="1.5" />
    </svg>
  );
}
