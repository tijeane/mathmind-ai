/**
 * MM-301: MVP answer grading — exact string match after light
 * normalization, or numeric comparison with tolerance. Does not parse
 * general math expressions (deferred past MVP).
 */

const NUMERIC_TOLERANCE = 1e-6;

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

export function checkAnswer(submittedAnswer: string, answerKey: string): boolean {
  const submitted = normalizeAnswer(submittedAnswer);
  const expected = normalizeAnswer(answerKey);

  if (!submitted || !expected) {
    return false;
  }

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
