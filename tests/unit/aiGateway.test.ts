import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createAiGateway,
  getAiGateway,
  MVP_AI_MODEL,
  resetAiGatewayForTests,
} from "@/lib/ai/gateway";

const { createMock } = vi.hoisted(() => ({
  createMock: vi.fn(),
}));

vi.mock("openai", () => ({
  default: class OpenAI {
    chat = {
      completions: {
        create: createMock,
      },
    };
  },
}));

describe("AI gateway (MM-500)", () => {
  beforeEach(() => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    createMock.mockReset();
    resetAiGatewayForTests();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetAiGatewayForTests();
  });

  it("calls OpenAI with the hardcoded MVP model and returns content", async () => {
    createMock.mockResolvedValue({
      model: MVP_AI_MODEL,
      choices: [{ message: { content: "  2 + 2 = 4  " } }],
    });

    const gateway = createAiGateway();
    const result = await gateway.complete({
      messages: [{ role: "user", content: "What is 2 + 2?" }],
    });

    expect(createMock).toHaveBeenCalledWith({
      model: MVP_AI_MODEL,
      messages: [{ role: "user", content: "What is 2 + 2?" }],
    });
    expect(result).toEqual({
      content: "2 + 2 = 4",
      model: MVP_AI_MODEL,
    });
  });

  it("throws when OpenAI returns an empty completion", async () => {
    createMock.mockResolvedValue({
      model: MVP_AI_MODEL,
      choices: [{ message: { content: "   " } }],
    });

    const gateway = createAiGateway();

    await expect(
      gateway.complete({
        messages: [{ role: "user", content: "Hello" }],
      }),
    ).rejects.toThrow(/empty completion/i);
  });

  it("throws when OPENAI_API_KEY is missing", () => {
    vi.stubEnv("OPENAI_API_KEY", "");

    expect(() => createAiGateway()).toThrow(/OPENAI_API_KEY/);
  });

  it("reuses a singleton from getAiGateway()", async () => {
    createMock.mockResolvedValue({
      model: MVP_AI_MODEL,
      choices: [{ message: { content: "ok" } }],
    });

    const first = getAiGateway();
    const second = getAiGateway();
    expect(first).toBe(second);

    await first.complete({
      messages: [{ role: "user", content: "ping" }],
    });
    expect(createMock).toHaveBeenCalledOnce();
  });
});
