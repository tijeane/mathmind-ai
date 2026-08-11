import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { TutorChat } from "@/components/practice/TutorChat";

describe("TutorChat", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            content: "Think about the equal parts first. What do you notice?",
            mode: "hint",
            rejected: false,
          },
        }),
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("asks the tutor API and shows the reply", async () => {
    render(<TutorChat exerciseId="ex-1" />);

    fireEvent.change(screen.getByLabelText("Question for the tutor"), {
      target: { value: "Can you give me a hint?" },
    });
    fireEvent.click(screen.getByRole("button", { name: /ask tutor/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise_id: "ex-1",
          question: "Can you give me a hint?",
        }),
      });
    });

    expect(await screen.findByText(/think about the equal parts first/i)).toBeInTheDocument();
    expect(screen.getByText("Can you give me a hint?")).toBeInTheDocument();
  });

  it("renders tutor LaTeX as plain fractions", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          content: "Start from \\( \\frac{3}{5} \\) and think about the denominator.",
          mode: "explain",
          rejected: false,
        },
      }),
    });

    render(<TutorChat exerciseId="ex-1" />);

    fireEvent.change(screen.getByLabelText("Question for the tutor"), {
      target: { value: "show me the steps" },
    });
    fireEvent.click(screen.getByRole("button", { name: /ask tutor/i }));

    expect(
      await screen.findByText("Start from 3/5 and think about the denominator."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/\\frac/)).not.toBeInTheDocument();
  });

  it("shows an error when the tutor API fails", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: { message: "Could not get a tutor response." },
      }),
    });

    render(<TutorChat exerciseId="ex-1" />);

    fireEvent.change(screen.getByLabelText("Question for the tutor"), {
      target: { value: "Help?" },
    });
    fireEvent.click(screen.getByRole("button", { name: /ask tutor/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Could not get a tutor response.");
  });
});
