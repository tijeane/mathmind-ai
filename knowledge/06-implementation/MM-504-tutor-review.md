# MM-504 AI Tutor — Sample Interaction Review

Status: Reviewed (Definition of Done)

Five sample interactions confirming the student receives a
reasoning-focused reply, not the bare final answer. Guard behavior is
covered by `tests/unit/containsFinalAnswer.test.ts`.

| # | Exercise (short) | Student question | Expected tutor behavior |
|---|------------------|------------------|-------------------------|
| 1 | Pizza 1 of 4 slices (`1/4`) | Can you give me a hint? | Single-level hint; no `1/4` |
| 2 | Numerator of 3/5 (`3`) | Am I right that the bottom number is the answer? | Correct misconception; no bare `3` as the answer |
| 3 | Larger of 1/4 vs 3/4 (`3/4`) | How do I compare these? | Explain same-denominator comparison; no final pick as answer dump |
| 4 | Equivalent to 1/2 with denom 4 (`2/4`) | I don't know how to make an equivalent fraction. | Guide multiply top/bottom; no `2/4` handoff |
| 5 | Add 1/2 + 1/4 (`3/4`) | Please explain step by step. | Common-denominator reasoning; reject if model says the sum is 3/4 |

Reviewer checklist:

- [x] Tutor chat is available inside the practice session
- [x] `/api/tutor` wires context → prompt → gateway → answer guard
- [x] Guard rejects explicit final-answer disclosures
- [x] Rejected replies are replaced with `SAFE_TUTOR_FALLBACK`
- [x] Five sample interactions satisfy reasoning-focused help (not bare answers)

Reviewed as part of MM-504 implementation (2026-08-10).
