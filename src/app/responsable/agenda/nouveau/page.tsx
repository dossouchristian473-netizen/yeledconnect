import { createClient } from "@/lib/supabase/server";
import { SubpageHeader } from "@/components/SubpageHeader";
import { NewEventForm } from "@/components/NewEventForm";

export default async function NouvelEvenementPage() {
  const supabase = createClient();
  const { data: rooms } = await supabase.from("rooms").select("id, name").order("name");

  return (
    <div>
      <SubpageHeader title="Nouvel événement" backHref="/responsable/agenda" />
      <NewEventForm rooms={rooms ?? []} />
    </div>
  );
}
