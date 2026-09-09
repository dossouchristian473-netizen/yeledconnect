import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SubpageHeader } from "@/components/SubpageHeader";
import { ExerciseQuiz } from "@/components/ExerciseQuiz";

export default async function ExercicePage({ params }: { params: { id: string; exerciseId: string } }) {
  const supabase = createClient();

  const { data: exercise } = await supabase
    .from("exercises")
    .select("id, title")
    .eq("id", params.exerciseId)
    .maybeSingle();

  if (!exercise) notFound();

  const [{ data: questions }, { data: submission }] = await Promise.all([
    supabase
      .from("exercise_questions_public")
      .select("id, position, question, choices")
      .eq("exercise_id", exercise.id)
      .order("position"),
    supabase
      .from("exercise_submissions")
      .select("score, total")
      .eq("exercise_id", exercise.id)
      .eq("child_id", params.id)
      .maybeSingle(),
  ]);

  return (
    <div>
      <SubpageHeader title={exercise.title} backHref={`/enfants/${params.id}`} />
      <ExerciseQuiz
        exerciseId={exercise.id}
        childId={params.id}
        questions={questions ?? []}
        initialSubmission={submission ?? null}
      />
    </div>
  );
}
