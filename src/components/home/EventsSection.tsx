import { createClient } from "@/lib/supabase/server";
import { unwrapOne } from "@/lib/supabase/one";
import { parentEventsFilter } from "@/lib/parentEvents";
import { DeleteRowButton } from "@/components/DeleteRowButton";
import { SectionEditToggle } from "@/components/home/SectionEditToggle";
import { EventAddForm } from "@/components/home/EventAddForm";

export async function EventsSection({
  canEdit,
  parentRoomIds,
}: {
  canEdit: boolean;
  parentRoomIds: string[] | null;
}) {
  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);

  let query = supabase
    .from("events")
    .select("id, title, event_date, room:room_id(name)")
    .gte("event_date", today);
  if (parentRoomIds) query = query.or(parentEventsFilter(parentRoomIds));
  const { data: events } = await query.order("event_date", { ascending: true }).limit(6);

  const { data: rooms } = canEdit
    ? await supabase.from("rooms").select("id, name").order("name")
    : { data: [] as { id: string; name: string }[] };

  return (
    <section id="evenements" className="scroll-mt-24">
      <h2 className="text-[16.5px] font-semibold mb-3 flex items-center gap-2">
        <CalendarIcon className="w-[17px] h-[17px] text-blue-dark" />
        Événements à venir
      </h2>

      {!events || events.length === 0 ? (
        <p className="text-soft text-[13.5px]">Aucun événement à venir pour le moment.</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {events.map((e) => {
            const room = unwrapOne<{ name: string }>(e.room);
            return (
              <div key={e.id} className="bg-card rounded-md2 shadow-card p-[14px] flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-bold text-[13.5px] truncate">{e.title}</div>
                  <div className="text-faint text-[11.5px] mt-0.5 flex items-center gap-2">
                    {new Date(e.event_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    <span className="rounded-full bg-blue-bg text-blue-dark font-bold text-[10px] tracking-wide uppercase px-2 py-[2px]">
                      {room ? `Classe ${room.name}` : "Toutes les classes"}
                    </span>
                  </div>
                </div>
                {canEdit && <DeleteRowButton table="events" id={e.id} />}
              </div>
            );
          })}
        </div>
      )}

      {canEdit && (
        <SectionEditToggle label="+ Ajouter un événement">
          <EventAddForm rooms={rooms ?? []} />
        </SectionEditToggle>
      )}
    </section>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.5 9.5h17" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 3v3.5M16 3v3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
