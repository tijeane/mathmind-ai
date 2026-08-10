import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ConceptList } from "@/components/concepts/ConceptList";

/**
 * MM-300: course detail — lists concepts so a student can choose one
 * and start a practice session. Auth gate matches /dashboard.
 */
export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: course } = await supabase
    .from("vw_courses_active")
    .select("id, title, description")
    .eq("id", id)
    .maybeSingle();

  if (!course) {
    notFound();
  }

  const { data: concepts } = await supabase
    .from("vw_concepts_active")
    .select("id, title, description, sequence_order")
    .eq("course_id", id)
    .order("sequence_order");

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <div className="flex flex-col gap-2">
        <Link
          href="/dashboard"
          className="text-sm text-zinc-600 underline-offset-2 hover:underline dark:text-zinc-400"
        >
          Back to dashboard
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          {course.title}
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{course.description}</p>
      </div>
      <ConceptList concepts={concepts ?? []} />
    </div>
  );
}
