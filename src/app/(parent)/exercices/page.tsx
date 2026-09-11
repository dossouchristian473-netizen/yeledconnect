import Link from "next/link";
import { createClient, getUser } from "@/lib/supabase/server";
import { getChildPhotoUrls } from "@/lib/supabase/childPhoto";
import { unwrapOne } from "@/lib/supabase/one";
import { exerciseTypeBadge } from "@/lib/exerciseTypes";
import { SubpageHeader } from "@/components/SubpageHeader";
import { ChildAvatar } from "@/components/ChildAvatar";

type Room = { name: string; color: string | null };
type Exercise = { id: string; title: string; description: string | null; type: string; content_category: string | null };
type Submission = { exercise_id: string; score: number; total: number };

export default async function ParentExercicesPage() {
  const supabase = createClient();
  const user = await getUser();

  const { data: family } = await supabase
    .from("families")
    .select("id")
    .eq("parent_id", user!.id)
    .maybeSingle();

  const { data: children } = family
    ? await supabase
        .from("children")
        .select("id, first_name, photo_url, current_room_id, room:current_room_id(name, color)")
        .eq("family_id", family.id)
    : {
        data: [] as {
          id: string;
          first_name: string;
          photo_url: string | null;
          current_room_id: string | null;
          room: Room | Room[] | null;
        }[],
      };

  const photoUrls = await getChildPhotoUrls(supabase, children ?? []);

  const byChild = await Promise.all(
    (children ?? []).map(async (c) => {
      const room = unwrapOne<Room>(c.room);
      if (!c.current_room_id) return { child: c, room, exercises: [] as Exercise[], submissions: [] as Submission[] };

      const [{ data: exercises }, { data: submissions }] = await Promise.all([
        supabase
          .from("exercises")
          .select("id, title, description, type, content_category")
          .eq("room_id", c.current_room_id),
        supabase.from("exercise_submissions").select("exercise_id, score, total").eq("child_id", c.id),
      ]);

      return { child: c, room, exercises: exercises ?? [], submissions: submissions ?? [] };
    })
  );

  const hasAnyExercise = byChild.some((b) => b.exercises.length > 0);

  return (
    <div>
      <SubpageHeader title="Exercices" />

      {!children || children.length === 0 ? (
        <p className="text-soft text-[14.5px] text-center pt-12 px-8">
          Ajoutez un enfant pour voir apparaître ses exercices ici.
        </p>
      ) : !hasAnyExercise ? (
        <p className="text-soft text-[14.5px] text-center pt-12 px-8">
          Aucun exercice publié pour le moment dans les classes de vos enfants.
        </p>
      ) : (
        <div className="px-6 pt-2 flex flex-col gap-6">
          {byChild.map(({ child, room, exercises, submissions }) => {
            if (exercises.length === 0) return null;
            function submissionFor(exerciseId: string) {
              return submissions.find((s) => s.exercise_id === exerciseId) ?? null;
            }
            return (
              <div key={child.id}>
                <div className="flex items-center gap-2.5 mb-3">
                  <ChildAvatar photoUrl={photoUrls[child.id]} firstName={child.first_name} size={30} color={room?.color} />
                  <h3 className="text-[15.5px] font-semibold">{child.first_name}</h3>
                </div>
                <div className="flex flex-col gap-3">
                  {exercises.map((ex) => {
                    const sub = submissionFor(ex.id);
                    return (
                      <Link
                        key={ex.id}
                        href={`/enfants/${child.id}/exercices/${ex.id}`}
                        className="bg-card rounded-md2 shadow-card p-[18px] flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="font-bold text-[15px] truncate">{ex.title}</div>
                            <span className="rounded-full bg-blue-bg text-blue-dark font-bold text-[10px] tracking-wide uppercase px-2 py-[2px] flex-shrink-0">
                              {exerciseTypeBadge(ex.type, ex.content_category)}
                            </span>
                          </div>
                          {ex.description && <p className="text-soft text-[13px] mt-0.5 truncate">{ex.description}</p>}
                        </div>
                        {ex.type !== "quiz" ? (
                          <span className="rounded-full bg-blue-bg text-blue-dark font-bold text-[11px] tracking-wide uppercase px-3.5 py-[7px] flex-shrink-0">
                            {ex.type === "pdf" ? "PDF" : "Voir"}
                          </span>
                        ) : sub ? (
                          <span className="rounded-full bg-teal-bg text-teal-dark font-bold text-[12px] px-3.5 py-[7px] flex-shrink-0">
                            {sub.score}/{sub.total}
                          </span>
                        ) : (
                          <span className="rounded-full bg-blue-bg text-blue-dark font-bold text-[11px] tracking-wide uppercase px-3.5 py-[7px] flex-shrink-0">
                            À faire
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
