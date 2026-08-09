import { describe, expect, it } from "vitest";

/**
 * Smoke test establishing the Vitest pipeline (ADR-008). Exercises pure
 * logic only — the actual /api/health route requires a live Supabase
 * connection and is covered by manual verification per MM-002 until
 * integration tests with a test database land.
 */
describe("health check contract", () => {
  it("defines the expected ok response shape", () => {
    const okResponse = { status: "ok", supabase: "reachable" } as const;

    expect(okResponse.status).toBe("ok");
    expect(okResponse.supabase).toBe("reachable");
  });

  it("defines the expected error response shape", () => {
    const errorResponse = { status: "error", message: "unreachable" } as const;

    expect(errorResponse.status).toBe("error");
    expect(typeof errorResponse.message).toBe("string");
  });
});
