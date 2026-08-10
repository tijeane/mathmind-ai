import "server-only";

/**
 * MM-501: structured tutor context for the AI orchestration pipeline
 * (MM-ARC-001 Context Builder stage). Consumed by MM-502 (Prompt Builder)
 * and later MM-504 (tutor route / response guard).
 *
 * `exercise.answerKey` is included for server-side correctness checks
 * (MM-504). Prompt templates must not surface it to the model.
 */
export type TutorContext = {
  userId: string;
  exercise: {
    id: string;
    conceptId: string;
    prompt: string;
    difficultyLevel: number;
    answerKey: string;
  };
  concept: {
    id: string;
    title: string;
    description: string;
  };
  recentAttempts: Array<{
    id: string;
    exerciseId: string;
    submittedAnswer: string;
    isCorrect: boolean;
    createdAt: string;
  }>;
};

export type TutorContextExerciseRow = {
  id: string;
  concept_id: string;
  prompt: string;
  difficulty_level: number;
  answer_key: string;
};

export type TutorContextConceptRow = {
  id: string;
  title: string;
  description: string;
};

export type TutorContextAttemptRow = {
  id: string;
  exercise_id: string;
  submitted_answer: string;
  is_correct: boolean;
  created_at: string;
};

export type BuildTutorContextDeps = {
  fetchExercise: (exerciseId: string) => Promise<TutorContextExerciseRow | null>;
  fetchConcept: (conceptId: string) => Promise<TutorContextConceptRow | null>;
  fetchRecentAttempts: (args: {
    userId: string;
    conceptId: string;
    limit: number;
  }) => Promise<TutorContextAttemptRow[]>;
};

/** How many prior attempts on the concept to attach for MVP tutoring. */
export const RECENT_ATTEMPTS_LIMIT = 5;

export class TutorContextError extends Error {
  readonly code: "BAD_REQUEST" | "NOT_FOUND";

  constructor(code: "BAD_REQUEST" | "NOT_FOUND", message: string) {
    super(message);
    this.name = "TutorContextError";
    this.code = code;
  }
}

/**
 * Assembles the current exercise, its concept description, and the
 * student's recent attempts on that concept into one payload.
 */
export async function buildTutorContext(
  input: { userId: string; exerciseId: string },
  deps: BuildTutorContextDeps,
): Promise<TutorContext> {
  const userId = input.userId?.trim();
  const exerciseId = input.exerciseId?.trim();

  if (!userId || !exerciseId) {
    throw new TutorContextError("BAD_REQUEST", "userId and exerciseId are required.");
  }

  const exercise = await deps.fetchExercise(exerciseId);
  if (!exercise) {
    throw new TutorContextError("NOT_FOUND", "Exercise not found.");
  }

  const concept = await deps.fetchConcept(exercise.concept_id);
  if (!concept) {
    throw new TutorContextError("NOT_FOUND", "Concept not found for exercise.");
  }

  if (!concept.description?.trim() || !concept.title?.trim()) {
    throw new TutorContextError("NOT_FOUND", "Concept is missing required fields.");
  }

  if (!exercise.prompt?.trim() || !exercise.answer_key?.trim()) {
    throw new TutorContextError("NOT_FOUND", "Exercise is missing required fields.");
  }

  const recentAttempts = await deps.fetchRecentAttempts({
    userId,
    conceptId: concept.id,
    limit: RECENT_ATTEMPTS_LIMIT,
  });

  return {
    userId,
    exercise: {
      id: exercise.id,
      conceptId: exercise.concept_id,
      prompt: exercise.prompt,
      difficultyLevel: exercise.difficulty_level,
      answerKey: exercise.answer_key,
    },
    concept: {
      id: concept.id,
      title: concept.title,
      description: concept.description,
    },
    recentAttempts: recentAttempts.map((attempt) => ({
      id: attempt.id,
      exerciseId: attempt.exercise_id,
      submittedAnswer: attempt.submitted_answer,
      isCorrect: attempt.is_correct,
      createdAt: attempt.created_at,
    })),
  };
}
