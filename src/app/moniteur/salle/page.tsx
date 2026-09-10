import Link from "next/link";
import { createClient, getUser } from "@/lib/supabase/server";
import { unwrapOne } from "@/lib/supabase/one";

export default async function SallePage() {
  const supabase = createClient();
  const user = await getUser();

  const [{ data: profile }, { data: assignments }] = await Promise.all([
    supabase.from("profiles").select("username").eq("id", user!.id).single(),
    supabase.from("moniteur_rooms").select("room_id, rooms(id, name, age_min, age_max, capacity)").eq("moniteur_id", user!.id),
  ]);

  type Room = { id: string; name: string; age_min: number | null; age_max: number | null; capacity: number | null };
  const rooms: Room[] = (assignments ?? [])
    .map((a) => unwrapOne<Room>(a.rooms))
    .filter((r): r is Room => !!r);

  const roomIds = rooms.map((r) => r.id);
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: children }, { data: attendanceToday }] = roomIds.length
    ? await Promise.all([
        supabase.from("children").select("id, current_room_id").in("current_room_id", roomIds),
        supabase
          .from("attendance")
          .select("child_id, checked_in_at, checked_out_at")
          .in("room_id", roomIds)
          .eq("sunday_date", today),
      ])
    : [
        { data: [] as { id: string; current_room_id: string | null }[] },
        { data: [] as { child_id: string; checked_in_at: string | null; checked_out_at: string | null }[] },
      ];

  const presentCount =
    attendanceToday?.filter((a) => a.checked_in_at && !a.checked_out_at).length ?? 0;

  return (
    <div>
      <div className="px-6 pt-4">
        <h1 className="text-[28px] leading-tight font-semibold">
          Bonjour {profile?.username ?? ""} 👋
        </h1>
        <p className="mt-1.5 text-soft text-[15px]">
          {rooms.length ? "Voici votre salle du jour." : "Aucune salle assignée pour le moment."}
        </p>
      </div>

      {rooms.length === 0 ? (
        <div className="mx-6 mt-5 bg-teal-bg rounded-lg2 p-[22px]">
          <h3 className="text-[17px] font-semibold mb-1.5">En attente d&apos;affectation</h3>
          <p className="text-soft text-[14px] leading-relaxed">
            Un responsable doit vous assigner une salle pour que vous puissiez
            gérer les présences et les enfants.
          </p>
        </div>
      ) : (
        <div className="px-6 pt-5 flex flex-col gap-3.5">
          {rooms.map((room) => {
            const roomChildren = children?.filter((c) => c.current_room_id === room.id) ?? [];
            return (
              <div key={room.id} className="bg-card rounded-lg2 shadow-card p-[22px]">
                <h3 className="text-[17px] font-semibold mb-1">{room.name}</h3>
                <p className="text-soft text-[14px]">
                  {room.age_min != null && room.age_max != null
                    ? `${room.age_min}-${room.age_max} ans · `
                    : ""}
                  {roomChildren.length} enfant{roomChildren.length > 1 ? "s" : ""} inscrit
                  {roomChildren.length > 1 ? "s" : ""}
                </p>
              </div>
            );
          })}

          <div className="bg-card rounded-lg2 shadow-card p-[22px] flex items-center justify-between">
            <div>
              <div className="text-[13px] font-semibold text-faint uppercase tracking-wide">
                Aujourd&apos;hui
              </div>
              <div className="text-[22px] font-bold mt-0.5">{presentCount} présent{presentCount > 1 ? "s" : ""}</div>
            </div>
            <Link
              href="/moniteur/enfants"
              className="inline-flex items-center gap-1.5 rounded-full bg-teal-dark text-white font-bold text-[14px] px-5 py-2.5 shadow-[0_10px_18px_-8px_rgba(31,156,134,0.5)]"
            >
              Présences
              <svg viewBox="0 0 24 24" fill="none" className="w-[15px] h-[15px]">
                <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>

          <Link
            href="/moniteur/annonces"
            className="flex items-center justify-between bg-card rounded-md2 shadow-card px-[18px] py-3.5 text-[14px] font-semibold text-blue-dark"
          >
            Annonces de classe
            <svg viewBox="0 0 24 24" fill="none" className="w-[15px] h-[15px]">
              <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}
