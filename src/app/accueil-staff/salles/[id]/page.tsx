import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SubpageHeader } from "@/components/SubpageHeader";
import { AttendanceButton } from "@/components/AttendanceButton";

export default async function AccueilSalleDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: room } = await supabase
    .from("rooms")
    .select("id, name, age_min, age_max, capacity")
    .eq("id", params.id)
    .maybeSingle();

  if (!room) notFound();

  const today = new Date().toISOString().slice(0, 10);
  const [{ data: children }, { data: attendanceToday }] = await Promise.all([
    supabase
      .from("children")
      .select("id, first_name, last_name, date_of_birth")
      .eq("current_room_id", room.id)
      .order("first_name"),
    supabase
      .from("attendance")
      .select("id, child_id, checked_in_at, checked_out_at")
      .eq("room_id", room.id)
      .eq("sunday_date", today),
  ]);

  function attendanceFor(childId: string) {
    return attendanceToday?.find((a) => a.child_id === childId) ?? null;
  }

  return (
    <div>
      <SubpageHeader title={room.name} backHref="/accueil-staff/salles" />
      <p className="px-6 -mt-3 mb-1 text-soft text-[14px]">
        {room.age_min != null && room.age_max != null ? `${room.age_min}-${room.age_max} ans` : "Tous âges"}
        {room.capacity != null ? ` · capacité ${room.capacity}` : ""}
      </p>

      {!children || children.length === 0 ? (
        <div className="flex flex-col items-center text-center px-8 pt-12">
          <h2 className="text-[20px] font-semibold mb-3">Aucun enfant inscrit</h2>
          <p className="text-soft text-[14.5px] leading-relaxed max-w-[340px]">
            Les enfants assignés à cette salle apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="px-6 pt-4 flex flex-col gap-3.5">
          {children.map((c) => {
            const att = attendanceFor(c.id);
            return (
              <div key={c.id} className="bg-card rounded-md2 shadow-card p-[18px] flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8ec9f5] to-[#5fa8e6] text-white flex items-center justify-center font-bold text-[16px] flex-shrink-0">
                  {c.first_name[0]?.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-[15.5px] truncate">
                    {c.first_name} {c.last_name ?? ""}
                  </div>
                  <div className="text-faint text-[12.5px] mt-0.5">Né(e) le {c.date_of_birth ?? "—"}</div>
                </div>
                <AttendanceButton
                  childId={c.id}
                  roomId={room.id}
                  attendanceId={att?.id ?? null}
                  checkedInAt={att?.checked_in_at ?? null}
                  checkedOutAt={att?.checked_out_at ?? null}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
