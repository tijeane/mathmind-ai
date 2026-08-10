import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CourseList } from "@/components/courses/CourseList";

/**
 * MM-200 component tests. The Supabase query that produces this data is
 * exercised manually against the live project (see PR description) -
 * this covers the presentational rendering logic only.
 */
describe("CourseList", () => {
  it("renders each course's title and description", () => {
    render(
      <CourseList
        courses={[
          { id: "1", title: "Fractions Foundations", description: "Learn fractions." },
          { id: "2", title: "Multiplication Basics", description: "Learn multiplication." },
        ]}
      />,
    );

    expect(screen.getByRole("heading", { name: "Fractions Foundations" })).toBeInTheDocument();
    expect(screen.getByText("Learn fractions.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Multiplication Basics" })).toBeInTheDocument();
    expect(screen.getByText("Learn multiplication.")).toBeInTheDocument();
  });

  it("shows an empty state when there are no courses", () => {
    render(<CourseList courses={[]} />);

    expect(screen.getByText(/no courses are available yet/i)).toBeInTheDocument();
  });
});
