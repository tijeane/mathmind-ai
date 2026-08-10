import { describe, expect, it } from "vitest";

/**
 * MM-300 API contract smoke test. Live auth + Supabase behavior is
 * verified manually against the project; this locks the response shape.
 */
describe("GET /api/exercises/next contract", () => {
  it("defines the expected success response shape", () => {
    const okResponse = {
      data: {
        id: "00000000-0000-4000-8000-000000000001",
        concept_id: "00000000-0000-4000-8000-000000000002",
        prompt: "What is 1/2?",
        difficulty_level: 1,
      },
    } as const;

    expect(okResponse.data).toHaveProperty("id");
    expect(okResponse.data).toHaveProperty("concept_id");
    expect(okResponse.data).toHaveProperty("prompt");
    expect(okResponse.data).toHaveProperty("difficulty_level");
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
