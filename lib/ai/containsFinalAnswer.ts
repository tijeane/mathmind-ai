import { checkAnswer } from "@/lib/exercises/checkAnswer";

/**
 * MM-504: lightweight response guard — not the full MM-ARC-001 Response
 * Validator. Rejects replies that appear to hand over the exercise's
 * exact final answer as a token (exact-match / numeric-tolerance via
 * checkAnswer).
 */
export function containsFinalAnswer(response: string, answerKey: string): boolean {
  const key = answerKey.trim();
  if (!key || !response.trim()) {
    return false;
  }

  const disclosurePattern = new RegExp(
    `(?:the\\s+)?(?:final\\s+)?answer\\s*(?:is|=|:)\\s*${escapeRegExp(key)}\\b`,
    "i",
  );
  if (disclosurePattern.test(response)) {
    return true;
  }

  const tokens = response.match(/[A-Za-z0-9./+-]+/g) ?? [];
  return tokens.some((token) => checkAnswer(token, key));
}

export const SAFE_TUTOR_FALLBACK =
  "I want to help you think it through without giving away the final answer. " +
  "Focus on the next small step in the problem — what do you notice first?";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
