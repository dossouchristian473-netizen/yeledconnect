import { createClient } from "@/lib/supabase/server";
import { DeleteRowButton } from "@/components/DeleteRowButton";
import { SectionEditToggle } from "@/components/home/SectionEditToggle";
import { EventAddForm } from "@/components/home/EventAddForm";

export async function EventsSection({ canEdit }: { canEdit: boolean }) {
  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: events } = await supabase
    .from("events")
    .select("id, title, event_date")
    .gte("event_date", today)
    .order("event_date", { ascending: true })
    .limit(6);

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
          {events.map((e) => (
            <div key={e.id} className="bg-card rounded-md2 shadow-card p-[14px] flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="font-bold text-[13.5px] truncate">{e.title}</div>
                <div className="text-faint text-[11.5px] mt-0.5">
                  {new Date(e.event_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                </div>
              </div>
              {canEdit && <DeleteRowButton table="events" id={e.id} />}
            </div>
          ))}
        </div>
      )}

      {canEdit && (
        <SectionEditToggle label="+ Ajouter un événement">
          <EventAddForm />
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
