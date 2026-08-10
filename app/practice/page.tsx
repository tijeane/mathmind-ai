import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { pickNextExercise, type ExerciseCandidate } from "@/lib/exercises/pickNextExercise";
import { PracticeSession } from "@/components/practice/PracticeSession";

/**
 * MM-300: practice session entry. Requires concept_id; loads the first
 * exercise server-side so the student sees a question immediately, then
 * hands off to PracticeSession for answer input and subsequent fetches
 * via /api/exercises/next.
 */
export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<{ concept_id?: string }>;
}) {
  const { concept_id: conceptId } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!conceptId) {
    redirect("/dashboard");
  }

  const { data: concept } = await supabase
    .from("vw_concepts_active")
    .select("id, title, course_id")
    .eq("id", conceptId)
    .maybeSingle();

  if (!concept) {
    redirect("/dashboard");
  }

  const { data: exercises, error: exercisesError } = await supabase
    .from("vw_exercises_active")
    .select("id, concept_id, prompt, difficulty_level")
    .eq("concept_id", concept.id);

  const initialExercise = pickNextExercise((exercises ?? []) as ExerciseCandidate[]);
  const initialError = exercisesError
    ? exercisesError.message
    : initialExercise
      ? null
      : "No exercises available for this concept.";

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-16">
      <Link
        href={`/courses/${concept.course_id}`}
        className="text-sm text-zinc-600 underline-offset-2 hover:underline dark:text-zinc-400"
      >
        Back to concepts
      </Link>
      <PracticeSession
        conceptId={concept.id}
        conceptTitle={concept.title}
        initialExercise={initialExercise}
        initialError={initialError}
      />
    </div>
  );
}
