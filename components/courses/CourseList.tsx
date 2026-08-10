type Course = {
  id: string;
  title: string;
  description: string;
};

/**
 * MM-200: read-only course listing. No edit/delete/create affordances -
 * that's intentional for MVP (IMPLEMENTATION_BACKLOG.md), not incomplete.
 */
export function CourseList({ courses }: { courses: Course[] }) {
  if (courses.length === 0) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">No courses are available yet.</p>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {courses.map((course) => (
        <li
          key={course.id}
          className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <h2 className="text-base font-medium text-zinc-900 dark:text-zinc-100">{course.title}</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{course.description}</p>
        </li>
      ))}
    </ul>
  );
}
