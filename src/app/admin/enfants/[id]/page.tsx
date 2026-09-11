import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getChildPhotoUrl } from "@/lib/supabase/childPhoto";
import { computeAge } from "@/lib/age";
import { unwrapOne } from "@/lib/supabase/one";
import { SubpageHeader } from "@/components/SubpageHeader";
import { ChildEditForm } from "@/components/ChildEditForm";
import { CreateAdoAccountForm } from "@/components/CreateAdoAccountForm";

export default async function AdminEnfantDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const [{ data: child }, { data: rooms }] = await Promise.all([
    supabase
      .from("children")
      .select(
        "id, first_name, last_name, date_of_birth, allergies, special_needs, current_room_id, photo_url, prayer_subject, home_address, second_parent_name, second_parent_phone, second_parent_email, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, custody_notes, ado_user_id"
      )
      .eq("id", params.id)
      .maybeSingle(),
    supabase.from("rooms").select("id, name, color").order("age_min"),
  ]);

  if (!child) notFound();

  const photoUrl = await getChildPhotoUrl(supabase, child.photo_url);

  const { data: adoProfile } = child.ado_user_id
    ? await supabase.from("profiles").select("username").eq("id", child.ado_user_id).maybeSingle()
    : { data: null };

  // RLS ("Administrateur a accès complet") donne accès aux remarques de
  // TOUS les moniteurs sur cet enfant.
  const { data: notes } = await supabase
    .from("moniteur_notes")
    .select("id, note, created_at, moniteur:moniteur_id(username)")
    .eq("child_id", child.id)
    .order("created_at", { ascending: false });

  const age = computeAge(child.date_of_birth);

  return (
    <div>
      <SubpageHeader title={child.first_name} backHref="/admin/enfants" />
      <div className="px-6 flex flex-col gap-4 pb-4">
        {age !== null && age >= 11 && (
          <CreateAdoAccountForm childId={child.id} adoUsername={adoProfile?.username ?? null} />
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
        </div>
      </div>
      <ChildEditForm child={child} photoUrl={photoUrl} backHref="/admin/enfants" rooms={rooms ?? []} />
    </div>
  );
}
