export type ExerciseCandidate = {
  id: string;
  concept_id: string;
  prompt: string;
  difficulty_level: number;
};

/**
 * MM-300: choose the next practice exercise for a concept.
 *
 * Without attempt history (MM-301), "next" is a random pick from the
 * candidates, optionally avoiding the exercise the student just saw.
 */
export function pickNextExercise(
  candidates: ExerciseCandidate[],
  excludeId?: string | null,
): ExerciseCandidate | null {
  if (candidates.length === 0) {
    return null;
  }

  const pool =
    excludeId && candidates.length > 1
      ? candidates.filter((exercise) => exercise.id !== excludeId)
      : candidates;

  const index = Math.floor(Math.random() * pool.length);
  return pool[index] ?? null;
}
