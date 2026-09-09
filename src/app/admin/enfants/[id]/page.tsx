import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getChildPhotoUrl } from "@/lib/supabase/childPhoto";
import { SubpageHeader } from "@/components/SubpageHeader";
import { ChildEditForm } from "@/components/ChildEditForm";

export default async function AdminEnfantDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const [{ data: child }, { data: rooms }] = await Promise.all([
    supabase
      .from("children")
      .select(
        "id, first_name, last_name, date_of_birth, allergies, special_needs, current_room_id, photo_url, prayer_subject, home_address, second_parent_name, second_parent_phone, second_parent_email, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, custody_notes"
      )
      .eq("id", params.id)
      .maybeSingle(),
    supabase.from("rooms").select("id, name").order("name"),
  ]);

  if (!child) notFound();

  const photoUrl = await getChildPhotoUrl(supabase, child.photo_url);

  return (
    <div>
      <SubpageHeader title={child.first_name} backHref="/admin/enfants" />
      <ChildEditForm child={child} photoUrl={photoUrl} backHref="/admin/enfants" rooms={rooms ?? []} />
    </div>
  );
}
