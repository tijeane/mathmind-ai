import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkAnswer } from "@/lib/exercises/checkAnswer";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type SubmitAttemptBody = {
  exercise_id?: unknown;
  submitted_answer?: unknown;
};

/**
 * POST /api/attempts
 *
 * MM-301: grade a submitted answer against exercises.answer_key (exact
 * match / numeric tolerance), persist an attempts row under RLS, and
 * return is_correct without revealing the answer_key.
 */
export async function POST(request: Request) {
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

  let body: SubmitAttemptBody;
  try {
    body = (await request.json()) as SubmitAttemptBody;
  } catch {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Request body must be JSON." } },
      { status: 400 },
    );
  }

  const exerciseId = typeof body.exercise_id === "string" ? body.exercise_id : null;
  const submittedAnswer =
    typeof body.submitted_answer === "string" ? body.submitted_answer.trim() : "";

  if (!exerciseId || !UUID_PATTERN.test(exerciseId)) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "A valid exercise_id is required." } },
      { status: 400 },
    );
  }

  if (!submittedAnswer) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "submitted_answer is required." } },
      { status: 400 },
    );
  }

  const { data: exercise, error: exerciseError } = await supabase
    .from("vw_exercises_active")
    .select("id, answer_key")
    .eq("id", exerciseId)
    .maybeSingle();

  if (exerciseError) {
    return NextResponse.json(
      { error: { code: "INTERNAL", message: exerciseError.message } },
      { status: 500 },
    );
  }

  if (!exercise) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Exercise not found." } },
      { status: 404 },
    );
  }

  const isCorrect = checkAnswer(submittedAnswer, exercise.answer_key as string);

  const { data: attempt, error: insertError } = await supabase
    .from("attempts")
    .insert({
      user_id: user.id,
      exercise_id: exercise.id,
      submitted_answer: submittedAnswer,
      is_correct: isCorrect,
    })
    .select("id, exercise_id, submitted_answer, is_correct, created_at")
    .single();

  if (insertError || !attempt) {
    return NextResponse.json(
      { error: { code: "INTERNAL", message: insertError?.message ?? "Could not record attempt." } },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: attempt }, { status: 201 });
}
