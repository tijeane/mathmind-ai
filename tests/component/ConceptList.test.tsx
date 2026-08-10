import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConceptList } from "@/components/concepts/ConceptList";

describe("ConceptList", () => {
  it("renders each concept with a Practice link", () => {
    render(
      <ConceptList
        concepts={[
          {
            id: "concept-1",
            title: "Understanding Parts of a Whole",
            description: "Introduces a fraction as equal parts of a whole.",
            sequence_order: 1,
          },
          {
            id: "concept-2",
            title: "Numerators and Denominators",
            description: "Explains numerator and denominator roles.",
            sequence_order: 2,
          },
        ]}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Understanding Parts of a Whole" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Numerators and Denominators" }),
    ).toBeInTheDocument();

    const practiceLinks = screen.getAllByRole("link", { name: /practice/i });
    expect(practiceLinks).toHaveLength(2);
    expect(practiceLinks[0]).toHaveAttribute("href", "/practice?concept_id=concept-1");
    expect(practiceLinks[1]).toHaveAttribute("href", "/practice?concept_id=concept-2");
  });

  it("shows an empty state when there are no concepts", () => {
    render(<ConceptList concepts={[]} />);

    expect(screen.getByText(/no concepts are available for this course yet/i)).toBeInTheDocument();
  });
});
