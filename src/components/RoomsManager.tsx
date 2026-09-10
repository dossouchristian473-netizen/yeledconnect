import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatAgeRange } from "@/lib/rooms";
import { DeleteRowButton } from "@/components/DeleteRowButton";
import { RoomIcon } from "@/components/RoomIcon";

export async function RoomsManager({ newHref }: { newHref: string }) {
  const supabase = createClient();

  const { data: rooms } = await supabase
    .from("rooms")
    .select("id, name, age_min, age_max, capacity, color, icon")
    .order("age_min");

  const roomIds = (rooms ?? []).map((r) => r.id);
  const { data: children } = roomIds.length
    ? await supabase.from("children").select("id, current_room_id").in("current_room_id", roomIds)
    : { data: [] as { id: string; current_room_id: string | null }[] };

  return (
    <div className="px-6 pt-2 flex flex-col gap-3.5">
      {(!rooms || rooms.length === 0) && (
        <p className="text-soft text-[14.5px] text-center pt-8">Aucune salle créée pour le moment.</p>
      )}

      {rooms?.map((room) => {
        const enrolled = children?.filter((c) => c.current_room_id === room.id).length ?? 0;
        return (
          <div key={room.id} className="bg-card rounded-lg2 shadow-card p-[18px] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <span
                className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: room.color ?? "#e7edf5" }}
              >
                <RoomIcon icon={room.icon} className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <h3 className="text-[16px] font-semibold mb-1 truncate">{room.name}</h3>
                <p className="text-soft text-[13.5px]">
                  {formatAgeRange(room.age_min, room.age_max)} · {enrolled} inscrit{enrolled > 1 ? "s" : ""}
                  {room.capacity != null ? ` · capacité ${room.capacity}` : ""}
                </p>
              </div>
            </div>
            <DeleteRowButton table="rooms" id={room.id} />
          </div>
        );
      })}

      <Link
        href={newHref}
        className="flex items-center justify-center gap-2 border-[1.5px] border-dashed border-[#c7d3e0] rounded-md2 py-4 text-blue-dark font-semibold text-[14.5px]"
      >
        + Nouvelle salle
      </Link>
    </div>
  );
}
