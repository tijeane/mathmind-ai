import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { pickNextExercise, type ExerciseCandidate } from "@/lib/exercises/pickNextExercise";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * GET /api/exercises/next?concept_id=&exclude_id=
 *
 * MM-300: returns one exercise for the given concept. Authenticated via
 * the cookie-scoped Supabase client (ADR-006); RLS on vw_exercises_active
 * enforces authenticated read. answer_key is intentionally omitted —
 * correctness checks land in MM-301.
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Sign in required." } },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const conceptId = searchParams.get("concept_id");
  const excludeId = searchParams.get("exclude_id");

  if (!conceptId || !UUID_PATTERN.test(conceptId)) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "A valid concept_id is required." } },
      { status: 400 },
    );
  }

  if (excludeId && !UUID_PATTERN.test(excludeId)) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "exclude_id must be a valid UUID when provided." } },
      { status: 400 },
    );
  }

  const { data: concept, error: conceptError } = await supabase
    .from("vw_concepts_active")
    .select("id")
    .eq("id", conceptId)
    .maybeSingle();

  if (conceptError) {
    return NextResponse.json(
      { error: { code: "INTERNAL", message: conceptError.message } },
      { status: 500 },
    );
  }

  if (!concept) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Concept not found." } },
      { status: 404 },
    );
  }

  const { data: exercises, error: exercisesError } = await supabase
    .from("vw_exercises_active")
    .select("id, concept_id, prompt, difficulty_level")
    .eq("concept_id", conceptId);

  if (exercisesError) {
    return NextResponse.json(
      { error: { code: "INTERNAL", message: exercisesError.message } },
      { status: 500 },
    );
  }

  const nextExercise = pickNextExercise((exercises ?? []) as ExerciseCandidate[], excludeId);

  if (!nextExercise) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "No exercises available for this concept." } },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: nextExercise });
}
