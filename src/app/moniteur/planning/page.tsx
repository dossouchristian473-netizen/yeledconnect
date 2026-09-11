import { createClient, getUser } from "@/lib/supabase/server";
import { unwrapOne } from "@/lib/supabase/one";
import { SubpageHeader } from "@/components/SubpageHeader";

type Room = { name: string };

export default async function MoniteurPlanningPage() {
  const supabase = createClient();
  const user = await getUser();
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: upcoming }, { data: past }] = await Promise.all([
    supabase
      .from("moniteur_schedule")
      .select("id, service_date, notes, room:room_id(name)")
      .eq("moniteur_id", user!.id)
      .gte("service_date", today)
      .order("service_date", { ascending: true }),
    supabase
      .from("moniteur_schedule")
      .select("id, service_date, notes, room:room_id(name)")
      .eq("moniteur_id", user!.id)
      .lt("service_date", today)
      .order("service_date", { ascending: false })
      .limit(6),
  ]);

  return (
    <div>
      <SubpageHeader title="Mon planning" backHref="/moniteur/salle" />

      <div className="px-6 flex flex-col gap-4">
        <div>
          <h3 className="text-[15.5px] font-semibold mb-3">Prochains dimanches</h3>
          {!upcoming || upcoming.length === 0 ? (
            <p className="text-soft text-[14.5px]">Aucune date d&apos;astreinte prévue pour le moment.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {upcoming.map((s) => {
                const room = unwrapOne<Room>(s.room);
                return (
                  <div key={s.id} className="bg-card rounded-md2 shadow-card p-[18px]">
                    <div className="font-bold text-[15px]">
                      {new Date(s.service_date).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </div>
                    {room && <p className="text-soft text-[13.5px] mt-0.5">{room.name}</p>}
                    {s.notes && <p className="text-[13.5px] text-ink mt-1.5">{s.notes}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {past && past.length > 0 && (
          <div>
            <h3 className="text-[15.5px] font-semibold mb-3">Historique</h3>
            <div className="bg-card rounded-lg2 shadow-card overflow-hidden">
              {past.map((s, i) => {
                const room = unwrapOne<Room>(s.room);
                return (
                  <div
                    key={s.id}
                    className={`flex items-center justify-between px-[18px] py-3.5 text-[14px] ${i > 0 ? "border-t border-border" : ""}`}
                  >
                    <span className="font-semibold">
                      {new Date(s.service_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                    </span>
                    <span className="text-faint text-[12.5px]">{room?.name ?? ""}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
