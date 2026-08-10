import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { PracticeSession } from "@/components/practice/PracticeSession";

const exercise = {
  id: "ex-1",
  concept_id: "concept-1",
  prompt: "What fraction is one half?",
  difficulty_level: 1,
};

describe("PracticeSession", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);

        if (url.startsWith("/api/attempts") && init?.method === "POST") {
          return {
            ok: true,
            json: async () => ({
              data: {
                id: "attempt-1",
                exercise_id: "ex-1",
                submitted_answer: "1/2",
                is_correct: true,
                created_at: "2026-08-10T00:00:00.000Z",
              },
            }),
          };
        }

        return {
          ok: true,
          json: async () => ({
            data: {
              id: "ex-2",
              concept_id: "concept-1",
              prompt: "What fraction is three fourths?",
              difficulty_level: 2,
            },
          }),
        };
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("submits an answer to /api/attempts and shows the correctness result", async () => {
    render(
      <PracticeSession
        conceptId="concept-1"
        conceptTitle="Understanding Parts of a Whole"
        initialExercise={exercise}
      />,
    );

    expect(screen.getByText("What fraction is one half?")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Your answer"), {
      target: { value: "1/2" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit answer/i }));

    expect(await screen.findByRole("status")).toHaveTextContent(/correct! your answer: 1\/2/i);
    expect(fetch).toHaveBeenCalledWith("/api/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        exercise_id: "ex-1",
        submitted_answer: "1/2",
      }),
    });
  });

  it("fetches the next exercise when Next exercise is clicked", async () => {
    render(
      <PracticeSession
        conceptId="concept-1"
        conceptTitle="Understanding Parts of a Whole"
        initialExercise={exercise}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /next exercise/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/exercises/next?concept_id=concept-1&exclude_id=ex-1",
      );
    });
    expect(await screen.findByText("What fraction is three fourths?")).toBeInTheDocument();
  });

  it("shows an initial error when no exercise was provided", () => {
    render(
      <PracticeSession
        conceptId="concept-1"
        conceptTitle="Understanding Parts of a Whole"
        initialExercise={null}
        initialError="No exercises available for this concept."
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("No exercises available for this concept.");
  });

  it("shows an error when the attempts API fails", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockImplementationOnce(async () => ({
      ok: false,
      json: async () => ({
        error: { message: "Could not submit your answer." },
      }),
    }));

    render(
      <PracticeSession
        conceptId="concept-1"
        conceptTitle="Understanding Parts of a Whole"
        initialExercise={exercise}
      />,
    );

    fireEvent.change(screen.getByLabelText("Your answer"), {
      target: { value: "1/2" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit answer/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Could not submit your answer.");
  });
});
