import Link from "next/link";
import { createClient, getUser } from "@/lib/supabase/server";
import { getRoomColorMap } from "@/lib/supabase/roomColors";
import { getChildPhotoUrls } from "@/lib/supabase/childPhoto";
import { SubpageHeader } from "@/components/SubpageHeader";
import { AttendanceButton } from "@/components/AttendanceButton";
import { AttendanceSummary } from "@/components/AttendanceSummary";
import { ChildAvatar } from "@/components/ChildAvatar";

export default async function MoniteurEnfantsPage() {
  const supabase = createClient();
  const user = await getUser();

  const { data: assignments } = await supabase
    .from("moniteur_rooms")
    .select("room_id")
    .eq("moniteur_id", user!.id);

  const roomIds = (assignments ?? []).map((a) => a.room_id);
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: children }, { data: attendanceToday }] = roomIds.length
    ? await Promise.all([
        supabase
          .from("children")
          .select("id, first_name, last_name, date_of_birth, current_room_id, photo_url")
          .in("current_room_id", roomIds)
          .order("first_name"),
        supabase
          .from("attendance")
          .select("id, child_id, checked_in_at, checked_out_at")
          .in("room_id", roomIds)
          .eq("sunday_date", today),
      ])
    : [
        { data: [] as { id: string; first_name: string; last_name: string | null; date_of_birth: string | null; current_room_id: string | null; photo_url: string | null }[] },
        { data: [] as { id: string; child_id: string; checked_in_at: string | null; checked_out_at: string | null }[] },
      ];

  const [roomColors, photoUrls] = await Promise.all([
    getRoomColorMap(supabase),
    getChildPhotoUrls(supabase, children ?? []),
  ]);

  function attendanceFor(childId: string) {
    return attendanceToday?.find((a) => a.child_id === childId) ?? null;
  }

  if (!roomIds.length) {
    return (
      <div>
        <SubpageHeader title="Enfants" backHref="/moniteur/salle" />
        <div className="flex flex-col items-center text-center px-8 pt-12">
          <h2 className="text-[22px] font-semibold mb-3">Aucune salle assignée</h2>
          <p className="text-soft text-[14.5px] leading-relaxed max-w-[340px]">
            Vous verrez ici la liste des enfants de votre salle dès qu&apos;un
            responsable vous l&apos;aura assignée.
          </p>
        </div>
      </div>
    );
  }

  if (!children || children.length === 0) {
    return (
      <div>
        <SubpageHeader title="Enfants" backHref="/moniteur/salle" />
        <div className="flex flex-col items-center text-center px-8 pt-12">
          <h2 className="text-[22px] font-semibold mb-3">Aucun enfant pour l&apos;instant</h2>
          <p className="text-soft text-[14.5px] leading-relaxed max-w-[340px]">
            Les enfants inscrits dans votre salle apparaîtront ici.
          </p>
        </div>
      </div>
    );
  }

  const presentCount = children.filter((c) => attendanceFor(c.id)?.checked_in_at).length;
  const absentCount = children.length - presentCount;

  return (
    <div>
      <SubpageHeader
        title="Enfants"
        backHref="/moniteur/salle"
        action={
          <Link
            href="/moniteur/annonces"
            className="rounded-full bg-blue-bg text-blue-dark font-bold text-[12px] px-3.5 py-2"
          >
            Annonces
          </Link>
        }
      />
      <AttendanceSummary present={presentCount} absent={absentCount} />
      <div className="px-6 pt-4 flex flex-col gap-3.5">
        {children.map((c) => {
          const att = attendanceFor(c.id);
          return (
            <div key={c.id} className="bg-card rounded-md2 shadow-card p-[18px] flex items-center gap-3.5">
              <Link href={`/moniteur/enfants/${c.id}`} className="flex items-center gap-3.5 flex-1 min-w-0">
                <ChildAvatar
                  photoUrl={photoUrls[c.id]}
                  firstName={c.first_name}
                  size={48}
                  color={c.current_room_id ? roomColors[c.current_room_id] : null}
                />
                <div className="min-w-0">
                  <div className="font-bold text-[15.5px] truncate">
                    {c.first_name} {c.last_name ?? ""}
                  </div>
                  <div className="text-faint text-[12.5px] mt-0.5">Né(e) le {c.date_of_birth ?? "—"}</div>
                </div>
              </Link>
              <AttendanceButton
                childId={c.id}
                roomId={c.current_room_id!}
                attendanceId={att?.id ?? null}
                checkedInAt={att?.checked_in_at ?? null}
                checkedOutAt={att?.checked_out_at ?? null}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
