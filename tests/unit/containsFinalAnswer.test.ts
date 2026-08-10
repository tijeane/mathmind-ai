import { describe, expect, it } from "vitest";
import { containsFinalAnswer, SAFE_TUTOR_FALLBACK } from "@/lib/ai/containsFinalAnswer";

describe("containsFinalAnswer (MM-504)", () => {
  it("rejects responses that disclose the answer explicitly", () => {
    expect(containsFinalAnswer("The answer is 1/4.", "1/4")).toBe(true);
    expect(containsFinalAnswer("Final answer: 3/4", "3/4")).toBe(true);
  });

  it("rejects responses that include the answer as a token", () => {
    expect(containsFinalAnswer("You should get 2/4 after simplifying.", "2/4")).toBe(true);
    expect(containsFinalAnswer("Yes — that matches.", "yes")).toBe(true);
  });

  it("allows reasoning-focused responses that avoid the final answer", () => {
    expect(
      containsFinalAnswer(
        "Think about how many equal parts the pizza was cut into, then how many you ate.",
        "1/4",
      ),
    ).toBe(false);
    expect(
      containsFinalAnswer(
        "Compare the numerators when the denominators are the same. Which is larger?",
        "3/4",
      ),
    ).toBe(false);
  });

  it("exposes a safe fallback message for rejected replies", () => {
    expect(SAFE_TUTOR_FALLBACK.toLowerCase()).toContain("without giving away the final answer");
  });
});
