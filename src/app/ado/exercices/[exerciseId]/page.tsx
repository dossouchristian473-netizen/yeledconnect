import { notFound } from "next/navigation";
import { createClient, getUser } from "@/lib/supabase/server";
import { SubpageHeader } from "@/components/SubpageHeader";
import { ExerciseQuiz } from "@/components/ExerciseQuiz";

export default async function AdoExercicePage({ params }: { params: { exerciseId: string } }) {
  const supabase = createClient();
  const user = await getUser();

  const { data: child } = await supabase
    .from("children")
    .select("id")
    .eq("ado_user_id", user!.id)
    .maybeSingle();

  if (!child) notFound();

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
      .eq("child_id", child.id)
      .maybeSingle(),
  ]);

  return (
    <div>
      <SubpageHeader title={exercise.title} backHref="/ado/exercices" />
      <ExerciseQuiz
        exerciseId={exercise.id}
        childId={child.id}
        questions={questions ?? []}
        initialSubmission={submission ?? null}
      />
    </div>
  );
}
