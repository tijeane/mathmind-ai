import { describe, expect, it } from "vitest";
import {
  buildTutorPrompt,
  resolveTutorPromptMode,
  TUTOR_SYSTEM_PROMPT,
} from "@/lib/ai/buildTutorPrompt";
import { SAMPLE_STUDENT_QUESTIONS, SAMPLE_TUTOR_CONTEXTS } from "@/lib/ai/sampleTutorContexts";
import type { TutorContext } from "@/lib/ai/buildTutorContext";

const baseContext: TutorContext = SAMPLE_TUTOR_CONTEXTS[0]!;

describe("resolveTutorPromptMode", () => {
  it("defaults to hint when the student asks for a hint", () => {
    expect(resolveTutorPromptMode("Can I get a hint?")).toBe("hint");
  });

  it("defaults to explain otherwise", () => {
    expect(resolveTutorPromptMode("Why is my answer wrong?")).toBe("explain");
  });

  it("honors an explicit mode", () => {
    expect(resolveTutorPromptMode("Please explain", "hint")).toBe("hint");
  });
});

describe("buildTutorPrompt (MM-502)", () => {
  it("builds system + user messages with pedagogy rules and no answer-key field", () => {
    const prompt = buildTutorPrompt({
      context: baseContext,
      studentQuestion: "Can you help me understand this?",
    });

    expect(prompt.messages).toHaveLength(2);
    expect(prompt.messages[0]).toEqual({
      role: "system",
      content: TUTOR_SYSTEM_PROMPT,
    });
    expect(prompt.messages[1]?.role).toBe("user");

    const rendered = prompt.messages.map((message) => message.content).join("\n");
    expect(rendered).toContain("Explain reasoning");
    expect(rendered).toContain("Never state the exercise's final answer");
    expect(rendered).toContain(baseContext.exercise.prompt);
    expect(rendered).toContain(baseContext.concept.description);
    expect(rendered).not.toMatch(/answer\s*key\s*:/i);
    expect(rendered).not.toContain(`Answer: ${baseContext.exercise.answerKey}`);
  });

  it("uses single-level hint instructions for hint requests", () => {
    const prompt = buildTutorPrompt({
      context: baseContext,
      studentQuestion: "Give me a hint please",
    });

    expect(prompt.mode).toBe("hint");
    expect(prompt.messages[1]?.content).toMatch(/single-level hint/i);
    expect(prompt.messages[1]?.content).toMatch(/do not solve the problem/i);
  });

  it("throws when the student question is blank", () => {
    expect(() =>
      buildTutorPrompt({
        context: baseContext,
        studentQuestion: "   ",
      }),
    ).toThrow(/studentQuestion is required/i);
  });

  it("produces pedagogy-safe prompts for at least 5 sample exercises", () => {
    expect(SAMPLE_TUTOR_CONTEXTS).toHaveLength(5);

    const reviewBundle = SAMPLE_TUTOR_CONTEXTS.map((context, index) => {
      const studentQuestion = SAMPLE_STUDENT_QUESTIONS[index]!;
      const prompt = buildTutorPrompt({ context, studentQuestion });
      const system = prompt.messages[0]?.content ?? "";
      const user = prompt.messages[1]?.content ?? "";
      const rendered = `${system}\n---\n${user}`;

      // "explain reasoning, don't just give the answer" principle
      expect(system.toLowerCase()).toContain("reasoning");
      expect(system.toLowerCase()).toMatch(/never state the exercise's final answer/);
      expect(system.toLowerCase()).toContain("single-level hint");
      expect(system.toLowerCase()).toContain("plain text");
      expect(system.toLowerCase()).toContain("latex");

      expect(user).toContain(context.exercise.prompt);
      expect(user).toContain(context.concept.title);
      expect(user).toContain(context.concept.description);
      expect(user).toContain(studentQuestion);
      // Never serialize the answer key as its own labeled field.
      expect(user).not.toMatch(/answer\s*key\s*:/i);
      expect(user).not.toContain(`answerKey`);
      expect(user).not.toContain(`Answer: ${context.exercise.answerKey}`);

      if (prompt.mode === "hint") {
        expect(user.toLowerCase()).toContain("single-level hint");
      }

      return {
        sample: index + 1,
        concept: context.concept.title,
        exercise: context.exercise.prompt,
        studentQuestion,
        mode: prompt.mode,
        rendered,
      };
    });

    // Human reviewers can inspect this structured bundle in test output / PR review.
    expect(reviewBundle).toHaveLength(5);
    for (const sample of reviewBundle) {
      expect(sample.rendered.length).toBeGreaterThan(100);
    }
  });
});
