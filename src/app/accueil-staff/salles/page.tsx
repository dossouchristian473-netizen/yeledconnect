import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SubpageHeader } from "@/components/SubpageHeader";

export default async function AccueilSallesPage() {
  const supabase = createClient();

  const { data: rooms } = await supabase
    .from("rooms")
    .select("id, name, age_min, age_max, capacity")
    .order("name");

  const roomIds = (rooms ?? []).map((r) => r.id);
  const today = new Date().toISOString().slice(0, 10);

  const { data: children } = roomIds.length
    ? await supabase.from("children").select("id, current_room_id").in("current_room_id", roomIds)
    : { data: [] as { id: string; current_room_id: string | null }[] };

  const { data: attendanceToday } = roomIds.length
    ? await supabase
        .from("attendance")
        .select("child_id, room_id, checked_in_at, checked_out_at")
        .in("room_id", roomIds)
        .eq("sunday_date", today)
    : { data: [] as { child_id: string; room_id: string | null; checked_in_at: string | null; checked_out_at: string | null }[] };

  return (
    <div>
      <SubpageHeader title="Salles" backHref="/accueil-staff/recherche" />

      {!rooms || rooms.length === 0 ? (
        <div className="flex flex-col items-center text-center px-8 pt-12">
          <h2 className="text-[22px] font-semibold mb-3">Aucune salle créée</h2>
          <p className="text-soft text-[14.5px] leading-relaxed max-w-[340px]">
            Un responsable doit créer des salles pour que le check-in soit possible.
          </p>
        </div>
      ) : (
        <div className="px-6 pt-5 flex flex-col gap-3.5">
          {rooms.map((room) => {
            const enrolled = children?.filter((c) => c.current_room_id === room.id).length ?? 0;
            const present =
              attendanceToday?.filter(
                (a) => a.room_id === room.id && a.checked_in_at && !a.checked_out_at
              ).length ?? 0;
            return (
              <Link
                key={room.id}
                href={`/accueil-staff/salles/${room.id}`}
                className="bg-card rounded-lg2 shadow-card p-[22px] flex items-center justify-between gap-3"
              >
                <div>
                  <h3 className="text-[16.5px] font-semibold mb-1">{room.name}</h3>
                  <p className="text-soft text-[13.5px]">
                    {room.age_min != null && room.age_max != null ? `${room.age_min}-${room.age_max} ans · ` : ""}
                    {enrolled} inscrit{enrolled > 1 ? "s" : ""}
                    {room.capacity != null ? ` · capacité ${room.capacity}` : ""}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-[22px] font-bold text-teal-dark">{present}</div>
                  <div className="text-faint text-[11px] font-semibold uppercase tracking-wide">présent{present > 1 ? "s" : ""}</div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
