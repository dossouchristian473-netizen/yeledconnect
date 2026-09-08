import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SubpageHeader } from "@/components/SubpageHeader";

export default async function EnfantDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: child } = await supabase
    .from("children")
    .select("id, first_name, last_name, date_of_birth, allergies, special_needs, current_room_id")
    .eq("id", params.id)
    .maybeSingle();

  if (!child) notFound();

  const { data: exercises } = child.current_room_id
    ? await supabase.from("exercises").select("id, title, description").eq("room_id", child.current_room_id)
    : { data: [] as { id: string; title: string; description: string | null }[] };

  const exerciseIds = (exercises ?? []).map((e) => e.id);
  const { data: submissions } = exerciseIds.length
    ? await supabase
        .from("exercise_submissions")
        .select("exercise_id, score, total")
        .eq("child_id", child.id)
        .in("exercise_id", exerciseIds)
    : { data: [] as { exercise_id: string; score: number; total: number }[] };

  function submissionFor(exerciseId: string) {
    return submissions?.find((s) => s.exercise_id === exerciseId) ?? null;
  }

  return (
    <div>
      <SubpageHeader title={child.first_name} backHref="/enfants" />

      <div className="px-6 flex flex-col gap-4">
        <div className="bg-card rounded-lg2 shadow-card p-[22px]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8ec9f5] to-[#5fa8e6] text-white flex items-center justify-center font-bold text-[16px] flex-shrink-0">
              {child.first_name[0]?.toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-[16px]">
                {child.first_name} {child.last_name ?? ""}
              </div>
              <div className="text-faint text-[12.5px] mt-0.5">Né(e) le {child.date_of_birth ?? "—"}</div>
            </div>
          </div>

          {(child.allergies || child.special_needs) && (
            <div className="mt-4 pt-4 border-t border-border flex flex-col gap-2.5">
              {child.allergies && (
                <div>
                  <div className="text-[11px] font-bold tracking-wide text-yellowtext uppercase mb-1">Allergies</div>
                  <p className="text-[14px] text-ink">{child.allergies}</p>
                </div>
              )}
              {child.special_needs && (
                <div>
                  <div className="text-[11px] font-bold tracking-wide text-yellowtext uppercase mb-1">
                    Besoins particuliers
                  </div>
                  <p className="text-[14px] text-ink">{child.special_needs}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {exercises && exercises.length > 0 && (
          <div>
            <h3 className="text-[15.5px] font-semibold mb-3">Exercices</h3>
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
                      <div className="font-bold text-[15px] truncate">{ex.title}</div>
                      {ex.description && <p className="text-soft text-[13px] mt-0.5 truncate">{ex.description}</p>}
                    </div>
                    {sub ? (
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
        )}
      </div>
    </div>
  );
}
