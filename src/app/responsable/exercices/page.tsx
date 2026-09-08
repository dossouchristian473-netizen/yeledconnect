import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SubpageHeader } from "@/components/SubpageHeader";
import { DeleteRowButton } from "@/components/DeleteRowButton";
import { unwrapOne } from "@/lib/supabase/one";

export default async function ResponsableExercicesPage() {
  const supabase = createClient();

  const { data: exercises } = await supabase
    .from("exercises")
    .select("id, title, room:room_id(name)")
    .order("created_at", { ascending: false });

  const exerciseIds = (exercises ?? []).map((e) => e.id);
  const { data: questions } = exerciseIds.length
    ? await supabase.from("exercise_questions").select("id, exercise_id").in("exercise_id", exerciseIds)
    : { data: [] as { id: string; exercise_id: string }[] };
  const { data: submissions } = exerciseIds.length
    ? await supabase.from("exercise_submissions").select("id, exercise_id").in("exercise_id", exerciseIds)
    : { data: [] as { id: string; exercise_id: string }[] };

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
          return (
            <div key={ex.id} className="bg-card rounded-lg2 shadow-card p-[18px] flex items-center justify-between gap-3">
              <div>
                <h3 className="text-[16px] font-semibold mb-1">{ex.title}</h3>
                <p className="text-soft text-[13.5px]">
                  {room?.name ?? "Salle inconnue"} · {qCount} question{qCount > 1 ? "s" : ""} · {sCount} réponse
                  {sCount > 1 ? "s" : ""}
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
