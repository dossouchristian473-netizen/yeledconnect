import { createClient } from "@/lib/supabase/server";
import { unwrapOne } from "@/lib/supabase/one";
import { PlanningAddForm } from "@/components/PlanningAddForm";
import { DeleteRowButton } from "@/components/DeleteRowButton";

type Room = { name: string };
type Moniteur = { username: string };

export async function PlanningManager() {
  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: schedule }, { data: moniteurs }, { data: rooms }] = await Promise.all([
    supabase
      .from("moniteur_schedule")
      .select("id, service_date, notes, moniteur:moniteur_id(username), room:room_id(name)")
      .gte("service_date", today)
      .order("service_date", { ascending: true }),
    supabase.from("moniteur_directory").select("id, username").order("username"),
    supabase.from("rooms").select("id, name").order("age_min"),
  ]);

  return (
    <div className="px-6 pt-2 flex flex-col gap-4">
      <PlanningAddForm moniteurs={moniteurs ?? []} rooms={rooms ?? []} />

      <div>
        <h3 className="text-[15.5px] font-semibold mb-3">Planning à venir</h3>
        {!schedule || schedule.length === 0 ? (
          <p className="text-soft text-[14.5px]">Aucune date planifiée pour le moment.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {schedule.map((s) => {
              const moniteur = unwrapOne<Moniteur>(s.moniteur);
              const room = unwrapOne<Room>(s.room);
              return (
                <div key={s.id} className="bg-card rounded-md2 shadow-card p-[18px] flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-bold text-[14.5px]">
                      {new Date(s.service_date).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </div>
                    <p className="text-soft text-[13px] mt-0.5">
                      {moniteur?.username ?? "Moniteur"}
                      {room ? ` · ${room.name}` : ""}
                    </p>
                    {s.notes && <p className="text-[13px] text-ink mt-1">{s.notes}</p>}
                  </div>
                  <DeleteRowButton table="moniteur_schedule" id={s.id} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
