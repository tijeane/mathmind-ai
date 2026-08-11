import { describe, expect, it } from "vitest";
import {
  checkAnswer,
  expandAnswerKeys,
  parseNumericAnswer,
} from "@/lib/exercises/checkAnswer";

describe("parseNumericAnswer", () => {
  it("parses decimals and simple fractions", () => {
    expect(parseNumericAnswer("3")).toBe(3);
    expect(parseNumericAnswer("1.5")).toBe(1.5);
    expect(parseNumericAnswer("1/2")).toBe(0.5);
    expect(parseNumericAnswer(" 3 / 4 ")).toBe(0.75);
  });

  it("returns null for non-numeric answers", () => {
    expect(parseNumericAnswer("yes")).toBeNull();
    expect(parseNumericAnswer("1/0")).toBeNull();
    expect(parseNumericAnswer("1+1")).toBeNull();
  });
});

describe("expandAnswerKeys", () => {
  it("adds the completed fraction for fill-in blanks", () => {
    expect(expandAnswerKeys("6", "Fill in the blank: 3/5 = ?/10")).toEqual(["6", "6/10"]);
    expect(expandAnswerKeys("10", "Fill in the blank: 3/5 = 6/?")).toEqual(["10", "6/10"]);
  });

  it("returns only the key when the prompt has no fill-in blank", () => {
    expect(expandAnswerKeys("1/2", "Simplify 4/8 to lowest terms.")).toEqual(["1/2"]);
  });
});

describe("checkAnswer", () => {
  it("matches exact answers after normalization", () => {
    expect(checkAnswer("yes", "yes")).toBe(true);
    expect(checkAnswer(" Yes ", "YES")).toBe(true);
    expect(checkAnswer("1/2", "1/2")).toBe(true);
    expect(checkAnswer("no", "yes")).toBe(false);
  });

  it("matches numeric values within tolerance, including fractions", () => {
    expect(checkAnswer("0.5", "1/2")).toBe(true);
    expect(checkAnswer("2/4", "1/2")).toBe(true);
    expect(checkAnswer("0.5000001", "0.5")).toBe(true);
    expect(checkAnswer("0.6", "1/2")).toBe(false);
  });

  it("accepts a completed fraction for fill-in blank prompts", () => {
    const prompt = "Fill in the blank: 3/5 = ?/10";
    expect(checkAnswer("6", "6", { prompt })).toBe(true);
    expect(checkAnswer("6/10", "6", { prompt })).toBe(true);
    expect(checkAnswer("12/20", "6", { prompt })).toBe(true);
    expect(checkAnswer("5", "6", { prompt })).toBe(false);
  });

  it("rejects blank submissions", () => {
    expect(checkAnswer("   ", "1/2")).toBe(false);
    expect(checkAnswer("1/2", "   ")).toBe(false);
  });
});
