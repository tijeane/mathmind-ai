/**
 * MM-301: MVP answer grading — exact string match after light
 * normalization, or numeric comparison with tolerance. Does not parse
 * general math expressions (deferred past MVP).
 */

const NUMERIC_TOLERANCE = 1e-6;

export type CheckAnswerOptions = {
  /**
   * Exercise prompt text. Used to accept common fill-in variants such as
   * writing `6/10` when the blank answer key is `6` for `3/5 = ?/10`.
   */
  prompt?: string;
};

function normalizeAnswer(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

/**
 * Parses plain decimals or simple a/b fractions. Returns null when the
 * string is not a numeric form we support for tolerance checks.
 */
export function parseNumericAnswer(value: string): number | null {
  const normalized = normalizeAnswer(value);
  if (!normalized) {
    return null;
  }

  const fractionMatch = normalized.match(/^(-?\d+)\/(-?\d+)$/);
  if (fractionMatch) {
    const numerator = Number(fractionMatch[1]);
    const denominator = Number(fractionMatch[2]);
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
      return null;
    }
    return numerator / denominator;
  }

  if (!/^-?\d+(\.\d+)?$/.test(normalized)) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Expands a stored answer key with prompt-aware aliases for fill-in blanks.
 * Example: prompt `3/5 = ?/10`, key `6` → also accepts `6/10`.
 */
export function expandAnswerKeys(answerKey: string, prompt?: string): string[] {
  const expected = normalizeAnswer(answerKey);
  if (!expected) {
    return [];
  }

  const keys = new Set<string>([expected]);
  if (!prompt) {
    return [...keys];
  }

  const blankDenominator = prompt.match(/=\s*\?\/(\d+)/i);
  if (blankDenominator && /^-?\d+$/.test(expected)) {
    keys.add(`${expected}/${blankDenominator[1]}`);
  }

  const blankNumerator = prompt.match(/=\s*(-?\d+)\/\?/i);
  if (blankNumerator && /^-?\d+$/.test(expected)) {
    keys.add(`${blankNumerator[1]}/${expected}`);
  }

  return [...keys];
}

function matchesSingleKey(submitted: string, expected: string): boolean {
  if (submitted === expected) {
    return true;
  }

  const submittedNumeric = parseNumericAnswer(submitted);
  const expectedNumeric = parseNumericAnswer(expected);

  if (submittedNumeric === null || expectedNumeric === null) {
    return false;
  }

  return Math.abs(submittedNumeric - expectedNumeric) <= NUMERIC_TOLERANCE;
}

export function checkAnswer(
  submittedAnswer: string,
  answerKey: string,
  options: CheckAnswerOptions = {},
): boolean {
  const submitted = normalizeAnswer(submittedAnswer);
  if (!submitted) {
    return false;
  }

  return expandAnswerKeys(answerKey, options.prompt).some((expected) =>
    matchesSingleKey(submitted, expected),
  );
}
