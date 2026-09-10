import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getChildPhotoUrl } from "@/lib/supabase/childPhoto";
import { unwrapOne } from "@/lib/supabase/one";
import { computeAge } from "@/lib/age";
import { SubpageHeader } from "@/components/SubpageHeader";
import { ChildAvatar } from "@/components/ChildAvatar";
import { RoomIcon } from "@/components/RoomIcon";
import { CreateAdoAccountForm } from "@/components/CreateAdoAccountForm";

type Room = { name: string; color: string | null; icon: string | null };

export default async function EnfantDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: child } = await supabase
    .from("children")
    .select(
      "id, first_name, last_name, date_of_birth, allergies, special_needs, current_room_id, photo_url, prayer_subject, home_address, second_parent_name, second_parent_phone, second_parent_email, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, custody_notes, ado_user_id, room:current_room_id(name, color, icon)"
    )
    .eq("id", params.id)
    .maybeSingle();

  if (!child) notFound();

  const room = unwrapOne<Room>(child.room);
  const photoUrl = await getChildPhotoUrl(supabase, child.photo_url);
  const age = computeAge(child.date_of_birth);

  const { data: adoProfile } = child.ado_user_id
    ? await supabase.from("profiles").select("username").eq("id", child.ado_user_id).maybeSingle()
    : { data: null };

  const { data: exercises } = child.current_room_id
    ? await supabase.from("exercises").select("id, title, description, type").eq("room_id", child.current_room_id)
    : { data: [] as { id: string; title: string; description: string | null; type: string }[] };

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
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <ChildAvatar photoUrl={photoUrl} firstName={child.first_name} size={48} color={room?.color} />
              <div className="min-w-0">
                <div className="font-bold text-[16px] truncate">
                  {child.first_name} {child.last_name ?? ""}
                </div>
                <div className="text-faint text-[12.5px] mt-0.5">Né(e) le {child.date_of_birth ?? "—"}</div>
                {room && (
                  <span
                    className="inline-flex items-center gap-1 mt-1.5 rounded-full px-2.5 py-[3px] text-[11px] font-bold"
                    style={{ backgroundColor: room.color ?? "#e7edf5" }}
                  >
                    <RoomIcon icon={room.icon} className="w-3 h-3" />
                    {room.name}
                  </span>
                )}
              </div>
            </div>
            <Link
              href={`/enfants/${child.id}/modifier`}
              className="text-blue-dark font-bold text-[12.5px] flex-shrink-0"
            >
              Modifier
            </Link>
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

          {child.prayer_subject && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="text-[11px] font-bold tracking-wide text-faint uppercase mb-1">
                Sujet de prière
              </div>
              <p className="text-[14px] text-ink">{child.prayer_subject}</p>
            </div>
          )}
        </div>

        {(child.second_parent_name ||
          child.emergency_contact_name ||
          child.home_address ||
          child.custody_notes) && (
          <div className="bg-card rounded-lg2 shadow-card p-[22px] flex flex-col gap-3.5">
            <h3 className="text-[15.5px] font-semibold">Contacts &amp; informations familiales</h3>

            {child.home_address && (
              <div>
                <div className="text-[11px] font-bold tracking-wide text-faint uppercase mb-1">Adresse</div>
                <p className="text-[14px] text-ink">{child.home_address}</p>
              </div>
            )}

            {child.second_parent_name && (
              <div>
                <div className="text-[11px] font-bold tracking-wide text-faint uppercase mb-1">
                  Deuxième parent
                </div>
                <p className="text-[14px] text-ink">{child.second_parent_name}</p>
                <p className="text-soft text-[13px]">
                  {[child.second_parent_phone, child.second_parent_email].filter(Boolean).join(" · ")}
                </p>
              </div>
            )}

            {child.emergency_contact_name && (
              <div>
                <div className="text-[11px] font-bold tracking-wide text-yellowtext uppercase mb-1">
                  Contact d&apos;urgence
                </div>
                <p className="text-[14px] text-ink">
                  {child.emergency_contact_name}
                  {child.emergency_contact_relationship ? ` (${child.emergency_contact_relationship})` : ""}
                </p>
                {child.emergency_contact_phone && (
                  <p className="text-soft text-[13px]">{child.emergency_contact_phone}</p>
                )}
              </div>
            )}

            {child.custody_notes && (
              <div>
                <div className="text-[11px] font-bold tracking-wide text-faint uppercase mb-1">
                  Informations de garde
                </div>
                <p className="text-[14px] text-ink whitespace-pre-line">{child.custody_notes}</p>
              </div>
            )}
          </div>
        )}

        {age !== null && age >= 11 && (
          <CreateAdoAccountForm childId={child.id} adoUsername={adoProfile?.username ?? null} />
        )}

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
        )}
      </div>
    </div>
  );
}
