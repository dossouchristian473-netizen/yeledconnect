import { createClient, getUser } from "@/lib/supabase/server";
import { unwrapOne } from "@/lib/supabase/one";
import { SubpageHeader } from "@/components/SubpageHeader";
import { NewExerciseForm } from "@/components/NewExerciseForm";

type Room = { id: string; name: string };

export default async function MoniteurNouvelExercicePage() {
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
      <SubpageHeader title="Nouvel exercice" backHref="/moniteur/exercices" />
      <NewExerciseForm rooms={rooms} listHref="/moniteur/exercices" />
    </div>
  );
}
