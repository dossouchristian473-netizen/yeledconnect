import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getChildPhotoUrl } from "@/lib/supabase/childPhoto";
import { unwrapOne } from "@/lib/supabase/one";
import { SubpageHeader } from "@/components/SubpageHeader";
import { ChildEditForm } from "@/components/ChildEditForm";

export default async function ModifierEnfantPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: child } = await supabase
    .from("children")
    .select(
      "id, first_name, last_name, date_of_birth, allergies, special_needs, current_room_id, photo_url, prayer_subject, home_address, second_parent_name, second_parent_phone, second_parent_email, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, custody_notes, room:current_room_id(color)"
    )
    .eq("id", params.id)
    .maybeSingle();

  if (!child) notFound();

  const roomColor = unwrapOne<{ color: string | null }>(child.room)?.color ?? null;
  const photoUrl = await getChildPhotoUrl(supabase, child.photo_url);

  return (
    <div>
      <SubpageHeader title="Modifier la fiche" backHref={`/enfants/${child.id}`} />
      <ChildEditForm
        child={child}
        photoUrl={photoUrl}
        backHref={`/enfants/${child.id}`}
        initialRoomColor={roomColor}
      />
    </div>
  );
}
