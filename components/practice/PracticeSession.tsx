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

const DIFFICULTY_LABELS: Record<number, string> = {
  1: "Easy",
  2: "Medium",
  3: "Hard",
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
        <p className="text-sm text-foreground-muted">Practicing</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{conceptTitle}</h1>
      </div>

      {isLoading && (
        <p className="text-sm text-foreground-muted" role="status">
          Loading exercise…
        </p>
      )}

      {error && (
        <p role="alert" aria-live="polite" className="text-sm text-error">
          {error}
        </p>
      )}

      {!isLoading && exercise && (
        <section className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-5 shadow-sm">
          <span className="inline-flex w-fit items-center rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
            {DIFFICULTY_LABELS[exercise.difficulty_level] ?? "Practice"}
          </span>
          <p className="font-mono text-lg text-foreground">{exercise.prompt}</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="answer" className="text-sm font-medium text-foreground">
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
                className="rounded-md border border-line bg-surface px-3 py-2 font-mono text-sm text-foreground outline-none focus:border-primary disabled:opacity-60"
              />
            </div>

            {attemptResult !== null && (
              <p
                role="status"
                aria-live="polite"
                className={
                  attemptResult.is_correct
                    ? "rounded-md bg-success-bg px-3 py-2 text-sm font-medium text-success"
                    : "rounded-md bg-error-bg px-3 py-2 text-sm font-medium text-error"
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
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Submitting..." : isSolved ? "Solved" : "Submit answer"}
              </button>
              <button
                type="button"
                onClick={() => void loadExercise(exercise.id)}
                disabled={isLoading || isSubmitting}
                className="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-60"
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
