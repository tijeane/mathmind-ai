import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { BuildTutorContextDeps } from "@/lib/ai/buildTutorContext";

/**
 * MM-501: Supabase-backed data source for buildTutorContext.
 * Uses the caller's RLS-scoped client (ADR-006) — attempts are own-row only.
 */
export function createSupabaseTutorContextDeps(supabase: SupabaseClient): BuildTutorContextDeps {
  return {
    async fetchExercise(exerciseId) {
      const { data, error } = await supabase
        .from("vw_exercises_active")
        .select("id, concept_id, prompt, difficulty_level, answer_key")
        .eq("id", exerciseId)
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },

    async fetchConcept(conceptId) {
      const { data, error } = await supabase
        .from("vw_concepts_active")
        .select("id, title, description")
        .eq("id", conceptId)
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },

    async fetchRecentAttempts({ userId, conceptId, limit }) {
      const { data: conceptExercises, error: exercisesError } = await supabase
        .from("vw_exercises_active")
        .select("id")
        .eq("concept_id", conceptId);

      if (exercisesError) {
        throw new Error(exercisesError.message);
      }

      const exerciseIds = (conceptExercises ?? []).map((row) => row.id as string);
      if (exerciseIds.length === 0) {
        return [];
      }

      const { data: attempts, error: attemptsError } = await supabase
        .from("vw_attempts_active")
        .select("id, exercise_id, submitted_answer, is_correct, created_at")
        .eq("user_id", userId)
        .in("exercise_id", exerciseIds)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (attemptsError) {
        throw new Error(attemptsError.message);
      }

      return attempts ?? [];
    },
  };
}
