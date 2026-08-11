import { describe, expect, it } from "vitest";
import { formatTutorContent } from "@/lib/ai/formatTutorContent";

describe("formatTutorContent", () => {
  it("converts inline LaTeX fractions to plain text", () => {
    expect(
      formatTutorContent(
        "Find an equivalent fraction to \\( \\frac{3}{5} \\) with denominator 10.",
      ),
    ).toBe("Find an equivalent fraction to 3/5 with denominator 10.");
  });

  it("handles display math and dollar delimiters", () => {
    expect(formatTutorContent("Compare $$\\frac{1}{2}$$ and $1/4$.")).toBe(
      "Compare 1/2 and 1/4.",
    );
  });

  it("leaves already-plain math unchanged", () => {
    expect(formatTutorContent("Think about 3/5 and what multiplies 5 to make 10.")).toBe(
      "Think about 3/5 and what multiplies 5 to make 10.",
    );
  });
});
