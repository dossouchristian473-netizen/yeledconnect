import { createClient, getUser } from "@/lib/supabase/server";
import { unwrapOne } from "@/lib/supabase/one";
import { SubpageHeader } from "@/components/SubpageHeader";
import { AnnouncementsManager } from "@/components/AnnouncementsManager";

type Room = { id: string; name: string };

export default async function MoniteurAnnoncesPage() {
  const supabase = createClient();
  const user = await getUser();

  const { data: assignments } = await supabase
    .from("moniteur_rooms")
    .select("room_id, rooms(id, name)")
    .eq("moniteur_id", user!.id);

  const rooms: Room[] = (assignments ?? [])
    .map((a) => unwrapOne<Room>(a.rooms))
    .filter((r): r is Room => !!r);

  return (
    <div>
      <SubpageHeader title="Annonces" backHref="/moniteur/salle" />
      <AnnouncementsManager rooms={rooms} />
    </div>
  );
}
