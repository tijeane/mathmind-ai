import type { ChatMessage } from "@/lib/ai/gateway";
import type { TutorContext } from "@/lib/ai/buildTutorContext";

export type TutorPromptMode = "explain" | "hint";

export type BuildTutorPromptInput = {
  context: TutorContext;
  studentQuestion: string;
  /** Defaults to "hint" when the question looks like a hint request. */
  mode?: TutorPromptMode;
};

export type TutorPrompt = {
  mode: TutorPromptMode;
  messages: ChatMessage[];
};

const HINT_REQUEST_PATTERN = /\b(hint|clue|nudge)\b/i;

/**
 * MM-502: versioned system instructions for MathMind tutoring.
 * Must not include answer keys — those stay on TutorContext for MM-504 only.
 */
export const TUTOR_SYSTEM_PROMPT = [
  "You are MathMind, a patient K-8 math tutor.",
  "Your job is to help the student understand the reasoning, not to finish the problem for them.",
  "Core rules:",
  "1. Explain reasoning with guiding questions and small steps.",
  "2. Never state the exercise's final answer (no bare number, fraction, or yes/no that solves it).",
  "3. If the student asks for a hint, give exactly one single-level hint — not a full worked solution.",
  "4. If the student asks for an explanation, walk through the approach without revealing the final result.",
  "5. Use the concept description and the student's recent attempts to address likely misconceptions.",
  "6. Keep language clear and age-appropriate.",
  "7. End with a short question that invites the student to try the next step themselves.",
  "8. Write math in plain text only (e.g. 3/5 or 3 ÷ 5). Never use LaTeX or backslash commands.",
].join("\n");

export function resolveTutorPromptMode(
  studentQuestion: string,
  explicitMode?: TutorPromptMode,
): TutorPromptMode {
  if (explicitMode) {
    return explicitMode;
  }
  return HINT_REQUEST_PATTERN.test(studentQuestion) ? "hint" : "explain";
}

function formatRecentAttempts(context: TutorContext): string {
  if (context.recentAttempts.length === 0) {
    return "No recent attempts on this concept yet.";
  }

  return context.recentAttempts
    .map((attempt, index) => {
      const outcome = attempt.isCorrect ? "correct" : "incorrect";
      return `${index + 1}. answer="${attempt.submittedAnswer}" (${outcome})`;
    })
    .join("\n");
}

function buildUserPrompt(
  context: TutorContext,
  studentQuestion: string,
  mode: TutorPromptMode,
): string {
  const modeInstruction =
    mode === "hint"
      ? "The student wants a single-level hint. Give one helpful nudge only — do not solve the problem."
      : "The student wants help understanding the problem. Explain the reasoning path without giving the final answer.";

  return [
    `Concept: ${context.concept.title}`,
    `Concept description: ${context.concept.description}`,
    "",
    `Exercise (difficulty ${context.exercise.difficultyLevel}):`,
    context.exercise.prompt,
    "",
    "Recent attempts on this concept:",
    formatRecentAttempts(context),
    "",
    `Student question: ${studentQuestion.trim()}`,
    "",
    modeInstruction,
    "Remember: do not reveal the final answer.",
  ].join("\n");
}

/**
 * Turns a TutorContext + student question into gateway-ready chat messages.
 * Intentionally omits `exercise.answerKey` from every prompt surface.
 */
export function buildTutorPrompt(input: BuildTutorPromptInput): TutorPrompt {
  const studentQuestion = input.studentQuestion?.trim();
  if (!studentQuestion) {
    throw new Error("studentQuestion is required.");
  }

  const mode = resolveTutorPromptMode(studentQuestion, input.mode);
  const userContent = buildUserPrompt(input.context, studentQuestion, mode);

  return {
    mode,
    messages: [
      { role: "system", content: TUTOR_SYSTEM_PROMPT },
      { role: "user", content: userContent },
    ],
  };
}
