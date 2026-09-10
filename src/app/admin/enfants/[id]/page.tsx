import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getChildPhotoUrl } from "@/lib/supabase/childPhoto";
import { computeAge } from "@/lib/age";
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

  const age = computeAge(child.date_of_birth);

  return (
    <div>
      <SubpageHeader title={child.first_name} backHref="/admin/enfants" />
      <div className="px-6 flex flex-col gap-4 pb-4">
        {age !== null && age >= 11 && (
          <CreateAdoAccountForm childId={child.id} adoUsername={adoProfile?.username ?? null} />
        )}
      </div>
      <ChildEditForm child={child} photoUrl={photoUrl} backHref="/admin/enfants" rooms={rooms ?? []} />
    </div>
  );
}
