import { createClient } from "@/lib/supabase/server";
import { SubpageHeader } from "@/components/SubpageHeader";
import { AnnouncementsManager } from "@/components/AnnouncementsManager";

export default async function ResponsableAnnoncesPage() {
  const supabase = createClient();
  const { data: rooms } = await supabase.from("rooms").select("id, name").order("age_min");

  return (
    <div>
      <SubpageHeader title="Annonces" backHref="/responsable/apercu" />
      <AnnouncementsManager rooms={rooms ?? []} />
    </div>
  );
}
