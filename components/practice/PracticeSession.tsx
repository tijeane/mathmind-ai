"use client";

import { useState, type FormEvent } from "react";
import { TutorChat } from "@/components/practice/TutorChat";

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

type AttemptResult = {
  id: string;
  submitted_answer: string;
  is_correct: boolean;
};

/**
 * MM-300/MM-301/MM-504: one-exercise-at-a-time practice UI. The first
 * exercise is loaded by the server page; subsequent ones come from
 * /api/exercises/next. Submitting an answer POSTs to /api/attempts
 * (MM-301). Tutor chat asks /api/tutor for hints/explanations (MM-504).
 *
 * Incorrect answers stay retryable so the student can use the tutor and
 * try again; only a correct answer locks the input for this exercise.
 */
export function PracticeSession({
  conceptId,
  conceptTitle,
  initialExercise,
  initialError = null,
}: PracticeSessionProps) {
  const [exercise, setExercise] = useState<PracticeExercise | null>(initialExercise);
  const [answer, setAnswer] = useState("");
  const [attemptResult, setAttemptResult] = useState<AttemptResult | null>(null);
  const [error, setError] = useState<string | null>(initialError);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSolved = attemptResult?.is_correct === true;

  async function loadExercise(excludeId?: string | null) {
    setIsLoading(true);
    setError(null);
    setAttemptResult(null);
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!exercise || !answer.trim() || isSolved) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise_id: exercise.id,
          submitted_answer: answer.trim(),
        }),
      });

      const payload = (await response.json()) as {
        data?: AttemptResult;
        error?: { message: string };
      };

      if (!response.ok || !payload.data) {
        setError(payload.error?.message ?? "Could not submit your answer.");
        return;
      }

      setAttemptResult(payload.data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
                disabled={isSolved || isSubmitting}
                className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            {attemptResult !== null && (
              <p
                role="status"
                aria-live="polite"
                className={
                  attemptResult.is_correct
                    ? "text-sm text-green-700 dark:text-green-400"
                    : "text-sm text-amber-700 dark:text-amber-400"
                }
              >
                {attemptResult.is_correct
                  ? `Correct! Your answer: ${attemptResult.submitted_answer}`
                  : `Not quite. Your answer: ${attemptResult.submitted_answer} — try again, or ask the tutor for a hint.`}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isSubmitting || isSolved || !answer.trim()}
                className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-[#ccc]"
              >
                {isSubmitting ? "Submitting..." : isSolved ? "Solved" : "Submit answer"}
              </button>
              <button
                type="button"
                onClick={() => void loadExercise(exercise.id)}
                disabled={isLoading || isSubmitting}
                className="rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
              >
                Next exercise
              </button>
            </div>
          </form>

          <TutorChat key={exercise.id} exerciseId={exercise.id} />
        </section>
      )}
    </div>
  );
}
