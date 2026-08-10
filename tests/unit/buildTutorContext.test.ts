import { describe, expect, it, vi } from "vitest";
import {
  buildTutorContext,
  RECENT_ATTEMPTS_LIMIT,
  TutorContextError,
  type BuildTutorContextDeps,
} from "@/lib/ai/buildTutorContext";

const exercise = {
  id: "ex-1",
  concept_id: "concept-1",
  prompt: "What is 1/2 + 1/4?",
  difficulty_level: 2,
  answer_key: "3/4",
};

const concept = {
  id: "concept-1",
  title: "Adding Fractions with Unlike Denominators",
  description: "Combines equivalent fractions and like-denominator addition.",
};

function createDeps(overrides: Partial<BuildTutorContextDeps> = {}): BuildTutorContextDeps {
  return {
    fetchExercise: vi.fn().mockResolvedValue(exercise),
    fetchConcept: vi.fn().mockResolvedValue(concept),
    fetchRecentAttempts: vi.fn().mockResolvedValue([
      {
        id: "attempt-1",
        exercise_id: "ex-1",
        submitted_answer: "1/2",
        is_correct: false,
        created_at: "2026-08-10T12:00:00.000Z",
      },
    ]),
    ...overrides,
  };
}

describe("buildTutorContext (MM-501)", () => {
  it("returns a well-formed context with exercise, concept, and recent attempts", async () => {
    const deps = createDeps();

    const context = await buildTutorContext({ userId: "user-1", exerciseId: "ex-1" }, deps);

    expect(context).toEqual({
      userId: "user-1",
      exercise: {
        id: "ex-1",
        conceptId: "concept-1",
        prompt: "What is 1/2 + 1/4?",
        difficultyLevel: 2,
        answerKey: "3/4",
      },
      concept: {
        id: "concept-1",
        title: "Adding Fractions with Unlike Denominators",
        description: "Combines equivalent fractions and like-denominator addition.",
      },
      recentAttempts: [
        {
          id: "attempt-1",
          exerciseId: "ex-1",
          submittedAnswer: "1/2",
          isCorrect: false,
          createdAt: "2026-08-10T12:00:00.000Z",
        },
      ],
    });

    expect(deps.fetchRecentAttempts).toHaveBeenCalledWith({
      userId: "user-1",
      conceptId: "concept-1",
      limit: RECENT_ATTEMPTS_LIMIT,
    });
  });

  it("allows an empty recentAttempts list when the student has no history", async () => {
    const deps = createDeps({
      fetchRecentAttempts: vi.fn().mockResolvedValue([]),
    });

    const context = await buildTutorContext({ userId: "user-1", exerciseId: "ex-1" }, deps);

    expect(context.recentAttempts).toEqual([]);
    expect(context.exercise.prompt).toBeTruthy();
    expect(context.concept.description).toBeTruthy();
  });

  it("throws BAD_REQUEST when userId or exerciseId is missing", async () => {
    const deps = createDeps();

    await expect(buildTutorContext({ userId: "", exerciseId: "ex-1" }, deps)).rejects.toEqual(
      expect.objectContaining({
        name: "TutorContextError",
        code: "BAD_REQUEST",
      }),
    );
  });

  it("throws NOT_FOUND when the exercise does not exist", async () => {
    const deps = createDeps({
      fetchExercise: vi.fn().mockResolvedValue(null),
    });

    await expect(
      buildTutorContext({ userId: "user-1", exerciseId: "missing" }, deps),
    ).rejects.toBeInstanceOf(TutorContextError);
  });

  it("throws NOT_FOUND when the concept is missing required fields", async () => {
    const deps = createDeps({
      fetchConcept: vi.fn().mockResolvedValue({
        id: "concept-1",
        title: "Adding Fractions",
        description: "   ",
      }),
    });

    await expect(
      buildTutorContext({ userId: "user-1", exerciseId: "ex-1" }, deps),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
