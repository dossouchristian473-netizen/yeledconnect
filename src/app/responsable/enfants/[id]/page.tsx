import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getChildPhotoUrl } from "@/lib/supabase/childPhoto";
import { unwrapOne } from "@/lib/supabase/one";
import { SubpageHeader } from "@/components/SubpageHeader";
import { ChildAvatar } from "@/components/ChildAvatar";
import { RoomIcon } from "@/components/RoomIcon";

type Room = { name: string; color: string | null; icon: string | null };

export default async function ResponsableEnfantDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: child } = await supabase
    .from("children")
    .select(
      "id, first_name, last_name, date_of_birth, allergies, special_needs, current_room_id, photo_url, prayer_subject, home_address, second_parent_name, second_parent_phone, second_parent_email, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, custody_notes, room:current_room_id(name, color, icon)"
    )
    .eq("id", params.id)
    .maybeSingle();

  if (!child) notFound();

  const room = unwrapOne<Room>(child.room);
  const photoUrl = await getChildPhotoUrl(supabase, child.photo_url);

  // RLS ("Responsable/Administrateur lisent toutes les notes") donne accès
  // aux remarques de TOUS les moniteurs sur cet enfant, pas seulement les
  // siennes — contrairement à la page équivalente côté Moniteur.
  const [{ data: notes }, { data: attendance }] = await Promise.all([
    supabase
      .from("moniteur_notes")
      .select("id, note, created_at, moniteur:moniteur_id(username)")
      .eq("child_id", child.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("attendance")
      .select("sunday_date, checked_in_at, checked_out_at")
      .eq("child_id", child.id)
      .order("sunday_date", { ascending: false })
      .limit(12),
  ]);

  return (
    <div>
      <SubpageHeader title={child.first_name} backHref="/responsable/enfants" />

      <div className="px-6 flex flex-col gap-4 pb-6">
        <div className="bg-card rounded-lg2 shadow-card p-[22px]">
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
              <div className="text-[11px] font-bold tracking-wide text-faint uppercase mb-1">Sujet de prière</div>
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
                <div className="text-[11px] font-bold tracking-wide text-faint uppercase mb-1">Deuxième parent</div>
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

        <div>
          <h3 className="text-[15.5px] font-semibold mb-3">Remarques des moniteurs</h3>
          <div className="bg-card rounded-lg2 shadow-card p-[18px]">
            {!notes || notes.length === 0 ? (
              <p className="text-soft text-[13.5px]">Aucune remarque pour le moment.</p>
            ) : (
              <div className="flex flex-col gap-3.5">
                {notes.map((n) => {
                  const moniteur = unwrapOne<{ username: string }>(n.moniteur);
                  return (
                    <div key={n.id} className="pt-3.5 border-t border-border first:border-0 first:pt-0">
                      <p className="text-[14px] leading-relaxed">{n.note}</p>
                      <div className="text-faint text-[11.5px] mt-1.5">
                        {moniteur?.username ?? "Moniteur"} ·{" "}
                        {new Date(n.created_at).toLocaleString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <p className="text-faint text-[12px] mt-2.5 px-1 leading-relaxed">
            Ces remarques ne sont jamais visibles par les parents.
          </p>
        </div>

        <div>
          <h3 className="text-[15.5px] font-semibold mb-3">Historique des présences</h3>
          {!attendance || attendance.length === 0 ? (
            <p className="text-soft text-[13.5px]">Aucune présence enregistrée pour le moment.</p>
          ) : (
            <div className="bg-card rounded-lg2 shadow-card overflow-hidden">
              {attendance.map((a, i) => (
                <div
                  key={a.sunday_date}
                  className={`flex items-center justify-between px-[18px] py-3.5 text-[14px] ${
                    i > 0 ? "border-t border-border" : ""
                  }`}
                >
                  <span className="font-semibold">
                    {new Date(a.sunday_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                  {a.checked_in_at ? (
                    <span className="rounded-full bg-teal-bg text-teal-dark font-bold text-[11.5px] px-3 py-1">
                      Présent
                    </span>
                  ) : (
                    <span className="rounded-full bg-[#fbe9ea] text-danger font-bold text-[11.5px] px-3 py-1">
                      Absent
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
