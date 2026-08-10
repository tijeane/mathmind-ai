import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { RegisterForm } from "@/components/auth/RegisterForm";

const pushMock = vi.fn();
const refreshMock = vi.fn();
const signUpMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: { signUp: signUpMock },
  }),
}));

function fillForm({
  name = "Ada Lovelace",
  email = "ada@example.com",
  password = "correcthorse1",
}: { name?: string; email?: string; password?: string } = {}) {
  fireEvent.change(screen.getByLabelText("Name"), { target: { value: name } });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: email } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: password } });
}

/**
 * MM-101 component tests. Covers the Definition of Done's success and
 * failure paths; the Supabase client and router are mocked since this is
 * a unit/component test, not an integration test against a live project.
 */
describe("RegisterForm", () => {
  beforeEach(() => {
    pushMock.mockReset();
    refreshMock.mockReset();
    signUpMock.mockReset();
  });

  it("signs up and redirects to /dashboard when a session is returned", async () => {
    signUpMock.mockResolvedValue({
      data: { session: { access_token: "token" }, user: { id: "user-1" } },
      error: null,
    });

    render(<RegisterForm />);
    fillForm();
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(signUpMock).toHaveBeenCalledWith({
        email: "ada@example.com",
        password: "correcthorse1",
        options: { data: { display_name: "Ada Lovelace" } },
      });
    });
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/dashboard"));
    expect(refreshMock).toHaveBeenCalled();
  });

  it("shows a check-your-email state when no session is returned", async () => {
    signUpMock.mockResolvedValue({
      data: { session: null, user: { id: "user-1" } },
      error: null,
    });

    render(<RegisterForm />);
    fillForm();
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Check your email to confirm your account",
    );
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("shows a clear error for a duplicate email without redirecting", async () => {
    signUpMock.mockResolvedValue({
      data: { session: null, user: null },
      error: { message: "User already registered", code: "user_already_exists" },
    });

    render(<RegisterForm />);
    fillForm();
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "An account with this email already exists. Try signing in instead.",
    );
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("shows a clear error for a weak password without redirecting", async () => {
    signUpMock.mockResolvedValue({
      data: { session: null, user: null },
      error: { message: "Password is too weak", code: "weak_password" },
    });

    render(<RegisterForm />);
    fillForm();
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "That password is too weak. Use at least 8 characters, including a letter and a number.",
    );
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("shows client-side validation errors without calling Supabase", async () => {
    render(<RegisterForm />);
    fillForm({ password: "short" });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText(/at least 8 characters/i)).toBeInTheDocument();
    expect(signUpMock).not.toHaveBeenCalled();
  });
});
