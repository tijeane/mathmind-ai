import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { getUserRole } from "@/lib/supabase/server";

const getUserMock = vi.fn();
const singleMock = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    getAll: () => [],
    set: vi.fn(),
  })),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: getUserMock },
    from: () => ({
      select: () => ({
        eq: () => ({ single: singleMock }),
      }),
    }),
  })),
}));

/**
 * MM-104: getUserRole() unit tests. The Supabase client (auth + query
 * builder) is mocked, so this only covers getUserRole()'s own branching
 * logic (no user / query error / success) - RLS itself can only be
 * verified against a live Supabase project with two real accounts (see
 * PR description), not from a mocked unit test.
 */
describe("getUserRole", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    getUserMock.mockReset();
    singleMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns null when there is no logged-in user", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });

    expect(await getUserRole()).toBeNull();
  });

  it("returns the user's role on success", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } } });
    singleMock.mockResolvedValue({ data: { role: "student" }, error: null });

    expect(await getUserRole()).toBe("student");
  });

  it("returns null when the profiles query errors (e.g. blocked by RLS)", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } } });
    singleMock.mockResolvedValue({ data: null, error: new Error("blocked by RLS") });

    expect(await getUserRole()).toBeNull();
  });
});
