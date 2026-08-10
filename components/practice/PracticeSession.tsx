"use client";

import { useState, type FormEvent } from "react";

export type PracticeExercise = {
  id: string;
  concept_id: string;
  prompt: string;
  difficulty_level: number;
};

type PracticeSessionProps = {
  conceptId: string;
  conceptTitle: string;
  initialExercise: PracticeExercise | null;
  initialError?: string | null;
};

/**
 * MM-300: one-exercise-at-a-time practice UI. The first exercise is
 * loaded by the server page; subsequent ones come from
 * /api/exercises/next. Accepts a free-text/numeric answer but does not
 * grade it yet — correctness lands in MM-301.
 */
export function PracticeSession({
  conceptId,
  conceptTitle,
  initialExercise,
  initialError = null,
}: PracticeSessionProps) {
  const [exercise, setExercise] = useState<PracticeExercise | null>(initialExercise);
  const [answer, setAnswer] = useState("");
  const [submittedAnswer, setSubmittedAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(initialError);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadExercise(excludeId?: string | null) {
    setIsLoading(true);
    setError(null);
    setSubmittedAnswer(null);
    setAnswer("");

    try {
      const params = new URLSearchParams({ concept_id: conceptId });
      if (excludeId) {
        params.set("exclude_id", excludeId);
      }

      const response = await fetch(`/api/exercises/next?${params.toString()}`);
      const payload = (await response.json()) as {
        data?: PracticeExercise;
        error?: { message: string };
      };

      if (!response.ok || !payload.data) {
        setExercise(null);
        setError(payload.error?.message ?? "Could not load an exercise.");
        return;
      }

      setExercise(payload.data);
    } catch {
      setExercise(null);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!exercise || !answer.trim()) {
      return;
    }

    setIsSubmitting(true);
    // MM-301 will persist and grade; for now we only accept the answer.
    setSubmittedAnswer(answer.trim());
    setIsSubmitting(false);
  }

  return (
    <div className="flex w-full max-w-xl flex-col gap-6">
      <div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Practicing</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          {conceptTitle}
        </h1>
      </div>

      {isLoading && <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading exercise...</p>}

      {error && (
        <p role="alert" aria-live="polite" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {!isLoading && exercise && (
        <section className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Difficulty {exercise.difficulty_level}
          </p>
          <p className="text-base text-zinc-900 dark:text-zinc-100">{exercise.prompt}</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="answer"
                className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
              >
                Your answer
              </label>
              <input
                id="answer"
                name="answer"
                type="text"
                inputMode="text"
                autoComplete="off"
                required
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                disabled={submittedAnswer !== null}
                className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            {submittedAnswer !== null && (
              <p
                role="status"
                aria-live="polite"
                className="text-sm text-zinc-600 dark:text-zinc-400"
              >
                Answer submitted: {submittedAnswer}. Checking correctness comes in a later update.
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isSubmitting || submittedAnswer !== null || !answer.trim()}
                className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-[#ccc]"
              >
                Submit answer
              </button>
              <button
                type="button"
                onClick={() => void loadExercise(exercise.id)}
                disabled={isLoading}
                className="rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
              >
                Next exercise
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
