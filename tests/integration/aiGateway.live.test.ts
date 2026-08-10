/** @vitest-environment node */

import { describe, expect, it } from "vitest";
import { createAiGateway, MVP_AI_MODEL } from "@/lib/ai/gateway";

/**
 * MM-500 live DoD check: a real OpenAI completion through the gateway.
 * Skipped in normal CI. Run locally with OPENAI_API_KEY loaded:
 *
 *   $env:LIVE_AI_GATEWAY = "1"
 *   # ensure OPENAI_API_KEY is set from .env.local
 *   npm run test -- tests/integration/aiGateway.live.test.ts
 */
describe.runIf(process.env.LIVE_AI_GATEWAY === "1")("AI gateway live call", () => {
  it("returns a real completion from OpenAI", async () => {
    const gateway = createAiGateway();
    const result = await gateway.complete({
      messages: [
        {
          role: "user",
          content: "Reply with exactly the single word: pong",
        },
      ],
    });

    expect(result.content.toLowerCase()).toContain("pong");
    expect(result.model).toMatch(new RegExp(MVP_AI_MODEL, "i"));
  }, 30_000);
});
