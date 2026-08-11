import Link from "next/link";

type Course = {
  id: string;
  title: string;
  description: string;
};

/**
 * MM-200: read-only course listing. No edit/delete/create affordances -
 * that's intentional for MVP (IMPLEMENTATION_BACKLOG.md), not incomplete.
 * MM-300 adds a link into the course's concepts for practice.
 */
export function CourseList({ courses }: { courses: Course[] }) {
  if (courses.length === 0) {
    return <p className="text-sm text-foreground-muted">No courses are available yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-4">
      {courses.map((course) => (
        <li key={course.id} className="rounded-xl border border-line bg-surface p-4 shadow-sm">
          <h2 className="text-base font-medium text-foreground">
            <Link
              href={`/courses/${course.id}`}
              className="underline-offset-2 hover:underline focus-visible:underline"
            >
              {course.title}
            </Link>
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">{course.description}</p>
        </li>
      ))}
    </ul>
  );
}
