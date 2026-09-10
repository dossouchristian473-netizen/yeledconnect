import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getChildPhotoUrls } from "@/lib/supabase/childPhoto";
import { formatAgeRange } from "@/lib/rooms";
import { SubpageHeader } from "@/components/SubpageHeader";
import { AttendanceButton } from "@/components/AttendanceButton";
import { AttendanceSummary } from "@/components/AttendanceSummary";
import { ChildAvatar } from "@/components/ChildAvatar";
import { RoomIcon } from "@/components/RoomIcon";

export default async function AccueilSalleDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: room } = await supabase
    .from("rooms")
    .select("id, name, age_min, age_max, capacity, color, icon")
    .eq("id", params.id)
    .maybeSingle();

  if (!room) notFound();

  const today = new Date().toISOString().slice(0, 10);
  const [{ data: children }, { data: attendanceToday }] = await Promise.all([
    supabase
      .from("children")
      .select("id, first_name, last_name, date_of_birth, photo_url")
      .eq("current_room_id", room.id)
      .order("first_name"),
    supabase
      .from("attendance")
      .select("id, child_id, checked_in_at, checked_out_at")
      .eq("room_id", room.id)
      .eq("sunday_date", today),
  ]);

  const photoUrls = await getChildPhotoUrls(supabase, children ?? []);

  function attendanceFor(childId: string) {
    return attendanceToday?.find((a) => a.child_id === childId) ?? null;
  }

  return (
    <div>
      <SubpageHeader title={room.name} backHref="/accueil-staff/salles" />
      <div className="px-6 -mt-3 mb-1 flex items-center gap-1.5 text-soft text-[14px]">
        <span
          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: room.color ?? "#e7edf5" }}
        >
          <RoomIcon icon={room.icon} className="w-3.5 h-3.5" />
        </span>
        {formatAgeRange(room.age_min, room.age_max)}
        {room.capacity != null ? ` · capacité ${room.capacity}` : ""}
      </div>

      {!children || children.length === 0 ? (
        <div className="flex flex-col items-center text-center px-8 pt-12">
          <h2 className="text-[20px] font-semibold mb-3">Aucun enfant inscrit</h2>
          <p className="text-soft text-[14.5px] leading-relaxed max-w-[340px]">
            Les enfants assignés à cette salle apparaîtront ici.
          </p>
        </div>
      ) : (
        <>
          <AttendanceSummary
            present={children.filter((c) => attendanceFor(c.id)?.checked_in_at).length}
            absent={children.length - children.filter((c) => attendanceFor(c.id)?.checked_in_at).length}
          />
          <div className="px-6 pt-4 flex flex-col gap-3.5">
          {children.map((c) => {
            const att = attendanceFor(c.id);
            return (
              <div key={c.id} className="bg-card rounded-md2 shadow-card p-[18px] flex items-center gap-3.5">
                <ChildAvatar photoUrl={photoUrls[c.id]} firstName={c.first_name} size={48} color={room.color} />
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
        </>
      )}
    </div>
  );
}
