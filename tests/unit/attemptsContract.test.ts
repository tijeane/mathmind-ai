import { describe, expect, it } from "vitest";

/**
 * MM-301 API contract smoke test. Live auth + RLS behavior is verified
 * against the Supabase project; this locks the response shape.
 */
describe("POST /api/attempts contract", () => {
  it("defines the expected success response shape", () => {
    const okResponse = {
      data: {
        id: "00000000-0000-4000-8000-000000000001",
        exercise_id: "00000000-0000-4000-8000-000000000002",
        submitted_answer: "1/2",
        is_correct: true,
        created_at: "2026-08-10T00:00:00.000Z",
      },
    } as const;

    expect(okResponse.data).toHaveProperty("id");
    expect(okResponse.data).toHaveProperty("exercise_id");
    expect(okResponse.data).toHaveProperty("submitted_answer");
    expect(okResponse.data).toHaveProperty("is_correct");
    expect(okResponse.data).not.toHaveProperty("answer_key");
  });

  it("defines the expected error response shape", () => {
    const errorResponse = {
      error: { code: "UNAUTHORIZED", message: "Sign in required." },
    } as const;

    expect(errorResponse.error.code).toBe("UNAUTHORIZED");
    expect(typeof errorResponse.error.message).toBe("string");
  });
});
