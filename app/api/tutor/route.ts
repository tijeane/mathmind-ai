import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildTutorContext, TutorContextError } from "@/lib/ai/buildTutorContext";
import { createSupabaseTutorContextDeps } from "@/lib/ai/createSupabaseTutorContextDeps";
import { buildTutorPrompt } from "@/lib/ai/buildTutorPrompt";
import { getAiGateway } from "@/lib/ai/gateway";
import { containsFinalAnswer, SAFE_TUTOR_FALLBACK } from "@/lib/ai/containsFinalAnswer";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type TutorBody = {
  exercise_id?: unknown;
  question?: unknown;
};

/**
 * POST /api/tutor
 *
 * MM-504: build context + prompt, call the AI gateway, and apply a
 * lightweight final-answer guard before returning the tutor reply.
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

  let body: TutorBody;
  try {
    body = (await request.json()) as TutorBody;
  } catch {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Request body must be JSON." } },
      { status: 400 },
    );
  }

  const exerciseId = typeof body.exercise_id === "string" ? body.exercise_id : null;
  const question = typeof body.question === "string" ? body.question.trim() : "";

  if (!exerciseId || !UUID_PATTERN.test(exerciseId)) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "A valid exercise_id is required." } },
      { status: 400 },
    );
  }

  if (!question) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "question is required." } },
      { status: 400 },
    );
  }

  try {
    const context = await buildTutorContext(
      { userId: user.id, exerciseId },
      createSupabaseTutorContextDeps(supabase),
    );
    const tutorPrompt = buildTutorPrompt({
      context,
      studentQuestion: question,
    });
    const completion = await getAiGateway().complete({
      messages: tutorPrompt.messages,
    });

    const rejected = containsFinalAnswer(completion.content, context.exercise.answerKey);
    const content = rejected ? SAFE_TUTOR_FALLBACK : completion.content;

    return NextResponse.json({
      data: {
        content,
        mode: tutorPrompt.mode,
        rejected,
        model: completion.model,
      },
    });
  } catch (error) {
    if (error instanceof TutorContextError) {
      const status = error.code === "NOT_FOUND" ? 404 : 400;
      return NextResponse.json({ error: { code: error.code, message: error.message } }, { status });
    }

    const message = error instanceof Error ? error.message : "Could not get a tutor response.";
    return NextResponse.json({ error: { code: "INTERNAL", message } }, { status: 500 });
  }
}
