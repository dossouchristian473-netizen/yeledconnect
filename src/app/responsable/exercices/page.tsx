import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SubpageHeader } from "@/components/SubpageHeader";
import { DeleteRowButton } from "@/components/DeleteRowButton";
import { unwrapOne } from "@/lib/supabase/one";

export default async function ResponsableExercicesPage() {
  const supabase = createClient();

  const { data: exercises } = await supabase
    .from("exercises")
    .select("id, title, type, room:room_id(name)")
    .order("created_at", { ascending: false });

  const exerciseIds = (exercises ?? []).map((e) => e.id);
  const [{ data: questions }, { data: submissions }] = exerciseIds.length
    ? await Promise.all([
        supabase.from("exercise_questions").select("id, exercise_id").in("exercise_id", exerciseIds),
        supabase.from("exercise_submissions").select("id, exercise_id").in("exercise_id", exerciseIds),
      ])
    : [{ data: [] as { id: string; exercise_id: string }[] }, { data: [] as { id: string; exercise_id: string }[] }];

  return (
    <div>
      <SubpageHeader title="Exercices" backHref="/responsable/apercu" />

      <div className="px-6 pt-2 flex flex-col gap-3.5">
        {(!exercises || exercises.length === 0) && (
          <p className="text-soft text-[14.5px] text-center pt-8">Aucun exercice créé pour le moment.</p>
        )}

        {exercises?.map((ex) => {
          const room = unwrapOne<{ name: string }>(ex.room);
          const qCount = questions?.filter((q) => q.exercise_id === ex.id).length ?? 0;
          const sCount = submissions?.filter((s) => s.exercise_id === ex.id).length ?? 0;
          const typeLabel = ex.type === "pdf" ? "PDF" : ex.type === "texte" ? "Texte" : "Quiz";
          return (
            <div key={ex.id} className="bg-card rounded-lg2 shadow-card p-[18px] flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-[16px] font-semibold">{ex.title}</h3>
                  <span className="rounded-full bg-blue-bg text-blue-dark font-bold text-[10.5px] tracking-wide uppercase px-2.5 py-[3px]">
                    {typeLabel}
                  </span>
                </div>
                <p className="text-soft text-[13.5px]">
                  {room?.name ?? "Salle inconnue"}
                  {ex.type === "quiz" ? ` · ${qCount} question${qCount > 1 ? "s" : ""} · ${sCount} réponse${sCount > 1 ? "s" : ""}` : ""}
                </p>
              </div>
              <DeleteRowButton table="exercises" id={ex.id} />
            </div>
          );
        })}

        <Link
          href="/responsable/exercices/nouveau"
          className="flex items-center justify-center gap-2 border-[1.5px] border-dashed border-[#c7d3e0] rounded-md2 py-4 text-blue-dark font-semibold text-[14.5px]"
        >
          + Nouvel exercice
        </Link>
      </div>
    </div>
  );
}
