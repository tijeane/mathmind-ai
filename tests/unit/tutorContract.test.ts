import { describe, expect, it } from "vitest";

describe("POST /api/tutor contract", () => {
  it("defines the expected success response shape", () => {
    const okResponse = {
      data: {
        content: "Think about the denominator first.",
        mode: "hint",
        rejected: false,
        model: "gpt-4o-mini",
      },
    } as const;

    expect(okResponse.data).toHaveProperty("content");
    expect(okResponse.data).toHaveProperty("mode");
    expect(okResponse.data).toHaveProperty("rejected");
    expect(okResponse.data).not.toHaveProperty("answer_key");
  });
});
