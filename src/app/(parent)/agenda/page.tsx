import { createClient } from "@/lib/supabase/server";
import { SubpageHeader } from "@/components/SubpageHeader";

export default async function AgendaPage() {
  const supabase = createClient();
  const { data: events } = await supabase
    .from("events")
    .select("id, title, description, event_date")
    .gte("event_date", new Date().toISOString().slice(0, 10))
    .order("event_date", { ascending: true });

  if (!events || events.length === 0) {
    return (
      <div>
        <SubpageHeader title="Agenda" />
        <div className="flex flex-col items-center text-center px-8 pt-12">
          <div className="w-[150px] h-[120px] mb-6" aria-hidden />
          <h2 className="text-[22px] font-semibold mb-3">Événements à venir</h2>
          <p className="text-soft text-[14.5px] leading-relaxed max-w-[340px]">
            Réunions, sorties, camps et temps spéciaux — bientôt visibles ici avec
            inscription en ligne.
          </p>
          <span className="mt-[22px] inline-block rounded-full bg-yellowbg text-yellowtext font-bold text-[12px] tracking-wide px-[18px] py-[9px]">
            PROCHAINE ÉTAPE
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SubpageHeader title="Agenda" />
      <div className="px-6 pt-5 flex flex-col gap-3.5">
        {events.map((e) => (
          <div key={e.id} className="bg-card rounded-md2 shadow-card p-[18px]">
            <div className="text-faint text-[12.5px] font-semibold mb-1">
              {new Date(e.event_date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
            </div>
            <div className="font-bold text-[15.5px]">{e.title}</div>
            {e.description && <p className="text-soft text-[13.5px] mt-1">{e.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
