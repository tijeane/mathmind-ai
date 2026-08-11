import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppHeader } from "@/components/layout/AppHeader";

vi.mock("@/components/layout/SignOutButton", () => ({
  SignOutButton: () => <button type="button">Sign out</button>,
}));

describe("AppHeader", () => {
  it("shows the display name and a sign-out control when signed in", () => {
    render(<AppHeader displayName="Ada" />);

    expect(screen.getByText("Ada")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign out/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /mathmind/i })).toHaveAttribute("href", "/dashboard");
  });

  it("hides the sign-out control when signed out and links the wordmark home", () => {
    render(<AppHeader displayName={null} />);

    expect(screen.queryByRole("button", { name: /sign out/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /mathmind/i })).toHaveAttribute("href", "/");
  });
});
