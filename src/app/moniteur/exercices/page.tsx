import Link from "next/link";
import { createClient, getUser } from "@/lib/supabase/server";
import { unwrapOne } from "@/lib/supabase/one";
import { SubpageHeader } from "@/components/SubpageHeader";
import { DeleteRowButton } from "@/components/DeleteRowButton";
import { exerciseTypeBadge } from "@/lib/exerciseTypes";

type Room = { id: string; name: string };
type ExerciseRoom = { name: string };

export default async function MoniteurExercicesPage() {
  const supabase = createClient();
  const user = await getUser();

  const { data: assignments } = await supabase
    .from("moniteur_rooms")
    .select("room_id, rooms(id, name)")
    .eq("moniteur_id", user!.id);

  const rooms: Room[] = (assignments ?? [])
    .map((a) => unwrapOne<Room>(a.rooms))
    .filter((r): r is Room => !!r);
  const roomIds = rooms.map((r) => r.id);

  const { data: exercises } = roomIds.length
    ? await supabase
        .from("exercises")
        .select("id, title, type, content_category, room:room_id(name)")
        .in("room_id", roomIds)
        .order("created_at", { ascending: false })
    : { data: [] as { id: string; title: string; type: string; content_category: string | null; room: ExerciseRoom | ExerciseRoom[] | null }[] };

  const exerciseIds = (exercises ?? []).map((e) => e.id);
  const [{ data: questions }, { data: submissions }] = exerciseIds.length
    ? await Promise.all([
        supabase.from("exercise_questions").select("id, exercise_id").in("exercise_id", exerciseIds),
        supabase.from("exercise_submissions").select("id, exercise_id").in("exercise_id", exerciseIds),
      ])
    : [{ data: [] as { id: string; exercise_id: string }[] }, { data: [] as { id: string; exercise_id: string }[] }];

  return (
    <div>
      <SubpageHeader title="Exercices" backHref="/moniteur/salle" />

      <div className="px-6 pt-2 flex flex-col gap-3.5">
        {roomIds.length === 0 ? (
          <p className="text-soft text-[14.5px] text-center pt-8">
            Aucune salle assignée pour le moment.
          </p>
        ) : !exercises || exercises.length === 0 ? (
          <p className="text-soft text-[14.5px] text-center pt-8">Aucun exercice créé pour le moment.</p>
        ) : (
          exercises.map((ex) => {
            const room = unwrapOne<ExerciseRoom>(ex.room);
            const qCount = questions?.filter((q) => q.exercise_id === ex.id).length ?? 0;
            const sCount = submissions?.filter((s) => s.exercise_id === ex.id).length ?? 0;
            const typeLabel = exerciseTypeBadge(ex.type, ex.content_category);
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
          })
        )}

        {roomIds.length > 0 && (
          <Link
            href="/moniteur/exercices/nouveau"
            className="flex items-center justify-center gap-2 border-[1.5px] border-dashed border-[#c7d3e0] rounded-md2 py-4 text-blue-dark font-semibold text-[14.5px]"
          >
            + Nouvel exercice
          </Link>
        )}
      </div>
    </div>
  );
}
