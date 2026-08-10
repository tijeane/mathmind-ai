import "server-only";
import OpenAI from "openai";

/**
 * MM-500: single hardcoded model for MVP. Model routing (MM-503) is
 * deferred — every gateway call uses this constant.
 */
export const MVP_AI_MODEL = "gpt-4o-mini" as const;

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type CompletionInput = {
  messages: ChatMessage[];
};

export type CompletionResult = {
  content: string;
  model: string;
};

export type AiGateway = {
  complete: (input: CompletionInput) => Promise<CompletionResult>;
};

function requireOpenAiApiKey(): string {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing OPENAI_API_KEY. Copy .env.example to .env.local and set your OpenAI key.",
    );
  }
  return apiKey;
}

/**
 * MM-500 AI Gateway — server-only OpenAI wrapper (ADR-005 / MM-ARC-001
 * provider layer). Isolates the OpenAI SDK so future providers can be
 * swapped without touching call sites. No routing: one model for MVP.
 *
 * Follows the same `server-only` pattern as `lib/supabase/service.ts`.
 */
export function createAiGateway(
  client: OpenAI = new OpenAI({ apiKey: requireOpenAiApiKey() }),
): AiGateway {
  return {
    async complete(input: CompletionInput): Promise<CompletionResult> {
      if (!input.messages.length) {
        throw new Error("At least one chat message is required.");
      }

      const response = await client.chat.completions.create({
        model: MVP_AI_MODEL,
        messages: input.messages,
      });

      const content = response.choices[0]?.message?.content?.trim();
      if (!content) {
        throw new Error("OpenAI returned an empty completion.");
      }

      return {
        content,
        model: response.model,
      };
    },
  };
}

let gateway: AiGateway | null = null;

/** Shared gateway instance for server routes / services. */
export function getAiGateway(): AiGateway {
  if (!gateway) {
    gateway = createAiGateway();
  }
  return gateway;
}

/** Test helper — clears the singleton between unit tests. */
export function resetAiGatewayForTests(): void {
  gateway = null;
}
