import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { SignOutButton } from "@/components/layout/SignOutButton";

const pushMock = vi.fn();
const refreshMock = vi.fn();
const signOutMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: { signOut: signOutMock },
  }),
}));

describe("SignOutButton", () => {
  beforeEach(() => {
    pushMock.mockReset();
    refreshMock.mockReset();
    signOutMock.mockReset();
  });

  it("signs out and redirects to /login", async () => {
    signOutMock.mockResolvedValue({ error: null });

    render(<SignOutButton />);
    fireEvent.click(screen.getByRole("button", { name: /sign out/i }));

    await waitFor(() => {
      expect(signOutMock).toHaveBeenCalled();
    });
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/login"));
    expect(refreshMock).toHaveBeenCalled();
  });

  it("stays on the page when sign-out fails", async () => {
    signOutMock.mockResolvedValue({ error: { message: "network" } });

    render(<SignOutButton />);
    fireEvent.click(screen.getByRole("button", { name: /sign out/i }));

    await waitFor(() => {
      expect(signOutMock).toHaveBeenCalled();
    });
    expect(pushMock).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /sign out/i })).toBeEnabled();
  });
});
