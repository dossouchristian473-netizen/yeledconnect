import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { RoomIcon } from "@/components/RoomIcon";

type Absentee = { child_id: string; first_name: string; last_name: string | null; room_id: string | null };

export async function AttendanceOverview({ date, reportsHref }: { date?: string; reportsHref?: string }) {
  const supabase = createClient();
  const selectedDate = date || new Date().toISOString().slice(0, 10);

  const [{ data: rooms }, { data: allChildren }, { data: attendanceForDate }, { data: absentees }, { data: history }] =
    await Promise.all([
      supabase.from("rooms").select("id, name, color, icon").order("age_min"),
      supabase.from("children").select("id, current_room_id").not("current_room_id", "is", null),
      supabase
        .from("attendance")
        .select("child_id, room_id, checked_in_at")
        .eq("sunday_date", selectedDate),
      supabase.rpc("get_absentees", { _sunday_date: selectedDate }) as unknown as Promise<{ data: Absentee[] | null }>,
      supabase
        .from("attendance")
        .select("sunday_date, checked_in_at")
        .not("checked_in_at", "is", null)
        .order("sunday_date", { ascending: false }),
    ]);

  const enrolledTotal = allChildren?.length ?? 0;
  const presentTotal = attendanceForDate?.filter((a) => a.checked_in_at).length ?? 0;
  const absentTotal = enrolledTotal - presentTotal;

  // Historique : dates distinctes ayant au moins une présence, les plus
  // récentes en premier, avec le total présents ce jour-là.
  const historyMap = new Map<string, number>();
  (history ?? []).forEach((row) => {
    historyMap.set(row.sunday_date, (historyMap.get(row.sunday_date) ?? 0) + 1);
  });
  const historyDates = Array.from(historyMap.entries()).slice(0, 8);

  function absenteesForRoom(roomId: string) {
    return (absentees ?? []).filter((a) => a.room_id === roomId);
  }
  function enrolledForRoom(roomId: string) {
    return allChildren?.filter((c) => c.current_room_id === roomId).length ?? 0;
  }
  function presentForRoom(roomId: string) {
    return attendanceForDate?.filter((a) => a.room_id === roomId && a.checked_in_at).length ?? 0;
  }

  return (
    <div className="px-6 pt-2 flex flex-col gap-4">
      <form method="get" className="flex items-center gap-2.5">
        <input
          type="date"
          name="date"
          defaultValue={selectedDate}
          className="flex-1 border border-border bg-card rounded-full px-[18px] py-3 text-[14.5px] shadow-card"
        />
        <button
          type="submit"
          className="rounded-full bg-blue-dark text-white font-bold text-[13.5px] px-5 py-3 flex-shrink-0"
        >
          Voir
        </button>
      </form>

      {reportsHref && (
        <Link
          href={`${reportsHref}?date=${selectedDate}`}
          className="flex items-center justify-between bg-card rounded-md2 shadow-card px-[18px] py-3.5 text-[14px] font-semibold text-blue-dark"
        >
          Comptes rendus des moniteurs
          <svg viewBox="0 0 24 24" fill="none" className="w-[15px] h-[15px]">
            <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-teal-bg rounded-lg2 p-[18px] text-center">
          <div className="text-[26px] font-bold text-teal-dark">{presentTotal}</div>
          <div className="text-teal-dark text-[11px] font-semibold uppercase tracking-wide mt-0.5">
            Présents / {enrolledTotal}
          </div>
        </div>
        <div className="bg-[#fbe9ea] rounded-lg2 p-[18px] text-center">
          <div className="text-[26px] font-bold text-danger">{absentTotal}</div>
          <div className="text-danger text-[11px] font-semibold uppercase tracking-wide mt-0.5">Absents</div>
        </div>
      </div>

      <div>
        <h3 className="text-[15.5px] font-semibold mb-3">Par salle</h3>
        {!rooms || rooms.length === 0 ? (
          <p className="text-soft text-[14.5px]">Aucune salle créée pour le moment.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {rooms.map((room) => {
              const enrolled = enrolledForRoom(room.id);
              const present = presentForRoom(room.id);
              const absent = absenteesForRoom(room.id);
              return (
                <div key={room.id} className="bg-card rounded-lg2 shadow-card p-[18px]">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-[15px] flex items-center gap-2">
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: room.color ?? "#e7edf5" }}
                      >
                        <RoomIcon icon={room.icon} className="w-3.5 h-3.5" />
                      </span>
                      {room.name}
                    </h4>
                    <span className="text-faint text-[12.5px] font-semibold">
                      {present}/{enrolled} présent{present > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="h-[7px] bg-border rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${enrolled ? Math.round((present / enrolled) * 100) : 0}%`,
                        backgroundColor: room.color ?? "#1f9c86",
                      }}
                    />
                  </div>
                  {absent.length > 0 && (
                    <p className="text-[13px] text-soft">
                      <span className="font-semibold text-danger">Absents : </span>
                      {absent.map((a) => `${a.first_name} ${a.last_name ?? ""}`.trim()).join(", ")}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-[15.5px] font-semibold mb-3">Historique</h3>
        {historyDates.length === 0 ? (
          <p className="text-soft text-[14.5px]">Aucune présence enregistrée pour le moment.</p>
        ) : (
          <div className="bg-card rounded-lg2 shadow-card overflow-hidden">
            {historyDates.map(([d, present], i) => (
              <a
                key={d}
                href={`?date=${d}`}
                className={`flex items-center justify-between px-[18px] py-3.5 text-[14px] ${
                  i > 0 ? "border-t border-border" : ""
                } ${d === selectedDate ? "bg-blue-bg" : ""}`}
              >
                <span className="font-semibold">
                  {new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                </span>
                <span className="text-faint text-[12.5px]">
                  {present} présent{present > 1 ? "s" : ""} · {enrolledTotal - present} absent
                  {enrolledTotal - present > 1 ? "s" : ""}
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
