import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CourseList } from "@/components/courses/CourseList";

/**
 * MM-100/MM-200: authenticated landing route. Lists the seeded,
 * read-only courses (MM-200) - no role-based UI yet, that's future
 * scope per the MVP Execution Rule in IMPLEMENTATION_BACKLOG.md.
 */
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: courses } = await supabase
    .from("vw_courses_active")
    .select("id, title, description")
    .order("title");

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        Welcome back, {user.email}
      </h1>
      <CourseList courses={courses ?? []} />
    </div>
  );
}
