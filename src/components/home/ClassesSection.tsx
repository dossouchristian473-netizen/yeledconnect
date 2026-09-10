import { createClient } from "@/lib/supabase/server";
import { formatAgeRange } from "@/lib/rooms";
import { ClassesGrid } from "@/components/home/ClassesGrid";

export async function ClassesSection({ canEdit }: { canEdit: boolean }) {
  const supabase = createClient();

  const [{ data: rooms }, { data: assignments }] = await Promise.all([
    supabase.from("rooms").select("id, name, age_min, age_max, color, icon, description, program").order("age_min"),
    supabase.from("moniteur_rooms").select("room_id, moniteur_id"),
  ]);

  const moniteurIds = Array.from(new Set((assignments ?? []).map((a) => a.moniteur_id)));
  const { data: moniteurs } = moniteurIds.length
    ? await supabase.from("moniteur_directory").select("id, username").in("id", moniteurIds)
    : { data: [] as { id: string; username: string }[] };

  function usernameFor(moniteurId: string) {
    return moniteurs?.find((m) => m.id === moniteurId)?.username;
  }

  const moniteursByRoom = new Map<string, string[]>();
  (assignments ?? []).forEach((a) => {
    const name = usernameFor(a.moniteur_id);
    if (!name) return;
    const list = moniteursByRoom.get(a.room_id) ?? [];
    list.push(name);
    moniteursByRoom.set(a.room_id, list);
  });

  const classes = (rooms ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    color: r.color,
    icon: r.icon,
    description: r.description,
    program: r.program,
    ageRange: formatAgeRange(r.age_min, r.age_max),
    moniteurs: moniteursByRoom.get(r.id) ?? [],
  }));

  return (
    <section id="classes" className="px-6 scroll-mt-24">
      <h2 className="text-[19px] font-semibold mb-3">Classiques</h2>
      {classes.length === 0 ? (
        <p className="text-soft text-[14px]">Aucune classe créée pour le moment.</p>
      ) : (
        <ClassesGrid classes={classes} canEdit={canEdit} />
      )}
    </section>
  );
}
