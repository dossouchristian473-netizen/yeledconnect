import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { unwrapOne } from "@/lib/supabase/one";
import { SubpageHeader } from "@/components/SubpageHeader";
import { AttendanceButton } from "@/components/AttendanceButton";
import { NoteForm } from "@/components/NoteForm";

export default async function MoniteurChildPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: child } = await supabase
    .from("children")
    .select("id, first_name, last_name, date_of_birth, allergies, special_needs, current_room_id")
    .eq("id", params.id)
    .maybeSingle();

  if (!child) notFound();

  const today = new Date().toISOString().slice(0, 10);
  const { data: attendance } = await supabase
    .from("attendance")
    .select("id, checked_in_at, checked_out_at")
    .eq("child_id", child.id)
    .eq("sunday_date", today)
    .maybeSingle();

  // RLS restreint déjà ce select aux notes du moniteur connecté.
  const { data: notes } = await supabase
    .from("moniteur_notes")
    .select("id, note, created_at")
    .eq("child_id", child.id)
    .order("created_at", { ascending: false });

  // RLS restreint déjà ces résultats aux exercices des salles du moniteur.
  const { data: results } = await supabase
    .from("exercise_submissions")
    .select("score, total, submitted_at, exercises(title)")
    .eq("child_id", child.id);

  return (
    <div>
      <SubpageHeader title={child.first_name} backHref="/moniteur/enfants" />

      <div className="px-6 flex flex-col gap-4">
        <div className="bg-card rounded-lg2 shadow-card p-[22px]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8ec9f5] to-[#5fa8e6] text-white flex items-center justify-center font-bold text-[16px] flex-shrink-0">
                {child.first_name[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-[16px] truncate">
                  {child.first_name} {child.last_name ?? ""}
                </div>
                <div className="text-faint text-[12.5px] mt-0.5">Né(e) le {child.date_of_birth ?? "—"}</div>
              </div>
            </div>
            {child.current_room_id && (
              <AttendanceButton
                childId={child.id}
                roomId={child.current_room_id}
                attendanceId={attendance?.id ?? null}
                checkedInAt={attendance?.checked_in_at ?? null}
                checkedOutAt={attendance?.checked_out_at ?? null}
              />
            )}
          </div>

          {(child.allergies || child.special_needs) && (
            <div className="mt-4 pt-4 border-t border-border flex flex-col gap-2.5">
              {child.allergies && (
                <div>
                  <div className="text-[11px] font-bold tracking-wide text-yellowtext uppercase mb-1">
                    Allergies
                  </div>
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

        {results && results.length > 0 && (
          <div>
            <h3 className="text-[15.5px] font-semibold mb-3">Résultats aux exercices</h3>
            <div className="bg-card rounded-lg2 shadow-card p-[18px] flex flex-col gap-3">
              {results.map((r, i) => {
                const exercise = unwrapOne<{ title: string }>(r.exercises);
                return (
                  <div key={i} className="flex items-center justify-between gap-3">
                    <span className="text-[14px] font-semibold">{exercise?.title ?? "Exercice"}</span>
                    <span className="rounded-full bg-teal-bg text-teal-dark font-bold text-[12px] px-3.5 py-[7px] flex-shrink-0">
                      {r.score}/{r.total}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-[15.5px] font-semibold mb-3">Mes notes privées</h3>
          <div className="bg-card rounded-lg2 shadow-card p-[22px]">
            <NoteForm childId={child.id} />

            {notes && notes.length > 0 && (
              <div className="mt-5 flex flex-col gap-3.5">
                {notes.map((n) => (
                  <div key={n.id} className="pt-3.5 border-t border-border first:border-0 first:pt-0">
                    <p className="text-[14px] leading-relaxed">{n.note}</p>
                    <div className="text-faint text-[11.5px] mt-1.5">
                      {new Date(n.created_at).toLocaleString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <p className="text-faint text-[12px] mt-2.5 px-1 leading-relaxed">
            Ces notes ne sont visibles que par vous et les responsables.
          </p>
        </div>
      </div>
    </div>
  );
}
