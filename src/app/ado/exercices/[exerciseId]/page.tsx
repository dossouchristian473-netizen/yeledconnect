import { notFound } from "next/navigation";
import { createClient, getUser } from "@/lib/supabase/server";
import { getExerciseFileUrl } from "@/lib/supabase/exerciseFile";
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
    .select("id, title, type, content, file_path")
    .eq("id", params.exerciseId)
    .maybeSingle();

  if (!exercise) notFound();

  if (exercise.type === "texte") {
    return (
      <div>
        <SubpageHeader title={exercise.title} backHref="/ado/exercices" />
        <div className="px-6">
          <div className="bg-card rounded-lg2 shadow-card p-[22px]">
            <p className="text-[14.5px] text-ink whitespace-pre-line">{exercise.content}</p>
          </div>
        </div>
      </div>
    );
  }

  if (exercise.type === "pdf") {
    const fileUrl = await getExerciseFileUrl(supabase, exercise.file_path);
    return (
      <div>
        <SubpageHeader title={exercise.title} backHref="/ado/exercices" />
        <div className="px-6">
          <div className="bg-card rounded-lg2 shadow-card p-[22px] flex flex-col items-center text-center gap-3">
            <p className="text-soft text-[14px]">Document à télécharger.</p>
            {fileUrl ? (
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-blue-dark text-white font-bold text-[13.5px] px-5 py-3"
              >
                Télécharger le PDF
              </a>
            ) : (
              <p className="text-danger text-[13px]">Fichier introuvable.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

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
