import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SubpageHeader } from "@/components/SubpageHeader";
import { DeleteRowButton } from "@/components/DeleteRowButton";

export default async function ResponsableAgendaPage() {
  const supabase = createClient();
  const { data: events } = await supabase
    .from("events")
    .select("id, title, description, event_date")
    .order("event_date", { ascending: true });

  return (
    <div>
      <SubpageHeader title="Agenda" backHref="/responsable/apercu" />

      <div className="px-6 pt-2 flex flex-col gap-3.5">
        {(!events || events.length === 0) && (
          <p className="text-soft text-[14.5px] text-center pt-8">Aucun événement créé pour le moment.</p>
        )}

        {events?.map((e) => (
          <div key={e.id} className="bg-card rounded-md2 shadow-card p-[18px] flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-faint text-[12.5px] font-semibold mb-1">
                {new Date(e.event_date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
              </div>
              <div className="font-bold text-[15.5px]">{e.title}</div>
              {e.description && <p className="text-soft text-[13.5px] mt-1">{e.description}</p>}
            </div>
            <DeleteRowButton table="events" id={e.id} />
          </div>
        ))}

        <Link
          href="/responsable/agenda/nouveau"
          className="flex items-center justify-center gap-2 border-[1.5px] border-dashed border-[#c7d3e0] rounded-md2 py-4 text-blue-dark font-semibold text-[14.5px]"
        >
          + Nouvel événement
        </Link>
      </div>
    </div>
  );
}
