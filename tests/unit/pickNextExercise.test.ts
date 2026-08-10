import { describe, expect, it, vi, afterEach } from "vitest";
import { pickNextExercise, type ExerciseCandidate } from "@/lib/exercises/pickNextExercise";

const exercises: ExerciseCandidate[] = [
  {
    id: "a",
    concept_id: "c1",
    prompt: "Prompt A",
    difficulty_level: 1,
  },
  {
    id: "b",
    concept_id: "c1",
    prompt: "Prompt B",
    difficulty_level: 2,
  },
  {
    id: "c",
    concept_id: "c1",
    prompt: "Prompt C",
    difficulty_level: 3,
  },
];

describe("pickNextExercise", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns null when there are no candidates", () => {
    expect(pickNextExercise([])).toBeNull();
  });

  it("returns the only candidate when there is one", () => {
    expect(pickNextExercise([exercises[0]!])).toEqual(exercises[0]);
  });

  it("avoids the excluded id when other candidates exist", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);

    const result = pickNextExercise(exercises, "a");

    expect(result?.id).not.toBe("a");
    expect(result?.id).toBe("b");
  });

  it("can still return the only candidate even if it matches excludeId", () => {
    expect(pickNextExercise([exercises[0]!], "a")).toEqual(exercises[0]);
  });
});
