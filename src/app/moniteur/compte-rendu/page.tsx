import { createClient, getUser } from "@/lib/supabase/server";
import { unwrapOne } from "@/lib/supabase/one";
import { SubpageHeader } from "@/components/SubpageHeader";
import { MoniteurReportForm } from "@/components/MoniteurReportForm";

export default async function MoniteurCompteRenduPage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const supabase = createClient();
  const user = await getUser();
  const sundayDate = searchParams.date || new Date().toISOString().slice(0, 10);

  type Room = { id: string; name: string };

  const [{ data: assignments }, { data: history }] = await Promise.all([
    supabase.from("moniteur_rooms").select("room_id, rooms(id, name)").eq("moniteur_id", user!.id),
    supabase
      .from("moniteur_reports")
      .select("id, room_id, sunday_date, report, rooms(name)")
      .eq("moniteur_id", user!.id)
      .order("sunday_date", { ascending: false })
      .limit(10),
  ]);

  const rooms: Room[] = (assignments ?? [])
    .map((a) => unwrapOne<Room>(a.rooms))
    .filter((r): r is Room => !!r);

  const roomIds = rooms.map((r) => r.id);
  const { data: reportsForDate } = roomIds.length
    ? await supabase
        .from("moniteur_reports")
        .select("room_id, report")
        .eq("moniteur_id", user!.id)
        .eq("sunday_date", sundayDate)
        .in("room_id", roomIds)
    : { data: [] as { room_id: string; report: string }[] };

  function reportFor(roomId: string) {
    return reportsForDate?.find((r) => r.room_id === roomId)?.report ?? "";
  }

  return (
    <div>
      <SubpageHeader title="Compte rendu" backHref="/moniteur/salle" />

      <div className="px-6 flex flex-col gap-4">
        {rooms.length === 0 ? (
          <p className="text-soft text-[14.5px] text-center pt-8">
            Aucune salle assignée pour le moment.
          </p>
        ) : (
          <>
            <form method="get" className="flex items-center gap-2.5">
              <input
                type="date"
                name="date"
                defaultValue={sundayDate}
                className="flex-1 border border-border bg-card rounded-full px-[18px] py-3 text-[14.5px] shadow-card"
              />
              <button
                type="submit"
                className="rounded-full bg-teal-dark text-white font-bold text-[13.5px] px-5 py-3 flex-shrink-0"
              >
                Voir
              </button>
            </form>

            {rooms.map((room) => (
              <MoniteurReportForm
                key={room.id}
                roomId={room.id}
                roomName={room.name}
                sundayDate={sundayDate}
                initialReport={reportFor(room.id)}
              />
            ))}
          </>
        )}

        {history && history.length > 0 && (
          <div>
            <h3 className="text-[15.5px] font-semibold mb-3">Vos derniers comptes rendus</h3>
            <div className="bg-card rounded-lg2 shadow-card overflow-hidden">
              {history.map((h, i) => {
                const room = unwrapOne<{ name: string }>(h.rooms);
                return (
                  <a
                    key={h.id}
                    href={`?date=${h.sunday_date}`}
                    className={`block px-[18px] py-3.5 ${i > 0 ? "border-t border-border" : ""} ${
                      h.sunday_date === sundayDate ? "bg-teal-bg" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-[13.5px]">
                        {new Date(h.sunday_date).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                        })}
                      </span>
                      <span className="text-faint text-[12px]">{room?.name}</span>
                    </div>
                    <p className="text-soft text-[13px] truncate">{h.report}</p>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
