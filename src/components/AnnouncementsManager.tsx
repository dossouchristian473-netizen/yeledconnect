import { createClient } from "@/lib/supabase/server";
import { unwrapOne } from "@/lib/supabase/one";
import { NewAnnouncementForm } from "@/components/NewAnnouncementForm";
import { DeleteRowButton } from "@/components/DeleteRowButton";

type Room = { id: string; name: string };

export async function AnnouncementsManager({ rooms }: { rooms: Room[] }) {
  const supabase = createClient();
  const roomIds = rooms.map((r) => r.id);

  const { data: announcements } = roomIds.length
    ? await supabase
        .from("class_announcements")
        .select("id, title, content, created_at, room:room_id(name)")
        .in("room_id", roomIds)
        .order("created_at", { ascending: false })
    : { data: [] as { id: string; title: string; content: string; created_at: string; room: Room | Room[] | null }[] };

  return (
    <div className="px-6 pt-2 flex flex-col gap-4">
      <NewAnnouncementForm rooms={rooms} />

      <div>
        <h3 className="text-[15.5px] font-semibold mb-3">Annonces publiées</h3>
        {!announcements || announcements.length === 0 ? (
          <p className="text-soft text-[14.5px]">Aucune annonce pour le moment.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {announcements.map((a) => {
              const room = unwrapOne<{ name: string }>(a.room);
              return (
                <div key={a.id} className="bg-card rounded-lg2 shadow-card p-[18px]">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div>
                      <span className="rounded-full bg-blue-bg text-blue-dark font-bold text-[10.5px] tracking-wide uppercase px-2.5 py-[3px]">
                        {room?.name ?? "Salle"}
                      </span>
                      <h4 className="font-semibold text-[15px] mt-1.5">{a.title}</h4>
                    </div>
                    <DeleteRowButton table="class_announcements" id={a.id} />
                  </div>
                  <p className="text-[14px] text-ink whitespace-pre-line">{a.content}</p>
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
