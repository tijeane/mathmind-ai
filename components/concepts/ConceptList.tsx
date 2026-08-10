import Link from "next/link";

type Concept = {
  id: string;
  title: string;
  description: string;
  sequence_order: number;
};

/**
 * MM-300: read-only concept listing for a course. Each concept links into
 * a practice session — no authoring UI (deferred past MVP).
 */
export function ConceptList({ concepts }: { concepts: Concept[] }) {
  if (concepts.length === 0) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        No concepts are available for this course yet.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {concepts.map((concept) => (
        <li
          key={concept.id}
          className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Concept {concept.sequence_order}
              </p>
              <h2 className="mt-1 text-base font-medium text-zinc-900 dark:text-zinc-100">
                {concept.title}
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{concept.description}</p>
            </div>
            <Link
              href={`/practice?concept_id=${concept.id}`}
              className="inline-flex shrink-0 items-center justify-center rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
            >
              Practice
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
