import { createClient, getUser } from "@/lib/supabase/server";
import { unwrapOne } from "@/lib/supabase/one";
import { SubpageHeader } from "@/components/SubpageHeader";

type Room = { name: string };
type Announcement = { id: string; title: string; content: string; created_at: string; room: Room | Room[] | null };

export default async function ParentAnnoncesPage() {
  const supabase = createClient();
  const user = await getUser();

  const { data: family } = await supabase
    .from("families")
    .select("id")
    .eq("parent_id", user!.id)
    .maybeSingle();

  const { data: children } = family
    ? await supabase.from("children").select("current_room_id").eq("family_id", family.id)
    : { data: [] as { current_room_id: string | null }[] };

  const roomIds = Array.from(
    new Set((children ?? []).map((c) => c.current_room_id).filter((id): id is string => !!id))
  );

  const { data: announcements } = roomIds.length
    ? await supabase
        .from("class_announcements")
        .select("id, title, content, created_at, room:room_id(name)")
        .in("room_id", roomIds)
        .order("created_at", { ascending: false })
    : { data: [] as Announcement[] };

  return (
    <div>
      <SubpageHeader title="Annonces" />
      <div className="px-6 pt-2">
        {!announcements || announcements.length === 0 ? (
          <p className="text-soft text-[14.5px] text-center pt-10 px-4">
            Aucune annonce pour le moment dans les classes de vos enfants.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {announcements.map((a) => {
              const room = unwrapOne<Room>(a.room);
              return (
                <div key={a.id} className="bg-card rounded-lg2 shadow-card p-[18px]">
                  <span className="rounded-full bg-blue-bg text-blue-dark font-bold text-[10.5px] tracking-wide uppercase px-2.5 py-[3px]">
                    {room?.name ?? "Salle"}
                  </span>
                  <h4 className="font-semibold text-[15px] mt-1.5">{a.title}</h4>
                  <p className="text-[14px] text-ink whitespace-pre-line mt-1">{a.content}</p>
                  <p className="text-faint text-[11.5px] mt-2">
                    {new Date(a.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
