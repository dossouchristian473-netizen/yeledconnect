import { createClient } from "@/lib/supabase/server";
import { unwrapOne } from "@/lib/supabase/one";
import { getChildPhotoUrls } from "@/lib/supabase/childPhoto";
import { AttendanceButton } from "@/components/AttendanceButton";
import { ChildAvatar } from "@/components/ChildAvatar";
import { Logo } from "@/components/Logo";
import { LogoutButton } from "@/components/LogoutButton";

export default async function RecherchePage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q?.trim() ?? "";
  const supabase = createClient();

  type ChildRow = {
    id: string;
    first_name: string;
    last_name: string | null;
    date_of_birth: string | null;
    allergies: string | null;
    special_needs: string | null;
    current_room_id: string | null;
    photo_url: string | null;
    families: { family_name: string } | { family_name: string }[] | null;
    room: { name: string; color: string | null } | { name: string; color: string | null }[] | null;
    authorized_pickups: { full_name: string; relationship: string | null }[] | null;
  };

  let children: ChildRow[] = [];
  if (q) {
    const { data } = await supabase
      .from("children")
      .select(
        "id, first_name, last_name, date_of_birth, allergies, special_needs, current_room_id, photo_url, families(family_name), room:current_room_id(name, color), authorized_pickups(full_name, relationship)"
      )
      .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%`)
      .limit(20);
    children = (data as ChildRow[] | null) ?? [];
  }

  const photoUrls = await getChildPhotoUrls(supabase, children);

  const today = new Date().toISOString().slice(0, 10);
  const childIds = children.map((c) => c.id);
  const { data: attendanceToday } = childIds.length
    ? await supabase
        .from("attendance")
        .select("id, child_id, checked_in_at, checked_out_at")
        .in("child_id", childIds)
        .eq("sunday_date", today)
    : { data: [] as { id: string; child_id: string; checked_in_at: string | null; checked_out_at: string | null }[] };

  function attendanceFor(childId: string) {
    return attendanceToday?.find((a) => a.child_id === childId) ?? null;
  }

  return (
    <div>
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <Logo />
        <LogoutButton />
      </div>

      <div className="px-6 pt-4">
        <h1 className="text-[26px] leading-tight font-semibold">Recherche</h1>
        <p className="mt-1 text-soft text-[14.5px]">Retrouvez un enfant pour le déposer ou le récupérer.</p>
      </div>

      <form action="/accueil-staff/recherche" method="get" className="px-6 pt-3">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Prénom ou nom de l'enfant..."
          className="w-full border border-border bg-card rounded-full px-[18px] py-3.5 text-[15px] shadow-card"
          autoFocus
        />
      </form>

      <div className="px-6 pt-5 flex flex-col gap-3.5">
        {q && children.length === 0 && (
          <p className="text-soft text-[14.5px] text-center pt-8">Aucun enfant trouvé pour « {q} ».</p>
        )}

        {children.map((c) => {
          const family = unwrapOne(c.families);
          const room = unwrapOne(c.room);
          const att = attendanceFor(c.id);
          return (
            <div key={c.id} className="bg-card rounded-lg2 shadow-card p-[18px]">
              <div className="flex items-center gap-3.5">
                <ChildAvatar photoUrl={photoUrls[c.id]} firstName={c.first_name} size={48} color={room?.color} />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-[15.5px] truncate">
                    {c.first_name} {c.last_name ?? ""}
                  </div>
                  <div className="text-faint text-[12.5px] mt-0.5">
                    {family ? `Famille ${family.family_name} · ` : ""}
                    {room ? room.name : "Aucune salle"}
                  </div>
                </div>
                {c.current_room_id ? (
                  <AttendanceButton
                    childId={c.id}
                    roomId={c.current_room_id}
                    attendanceId={att?.id ?? null}
                    checkedInAt={att?.checked_in_at ?? null}
                    checkedOutAt={att?.checked_out_at ?? null}
                  />
                ) : (
                  <span className="text-faint text-[11.5px] font-semibold">Sans salle</span>
                )}
              </div>

              {(c.allergies || c.special_needs) && (
                <div className="mt-3.5 pt-3.5 border-t border-border flex flex-col gap-1.5">
                  {c.allergies && (
                    <p className="text-[13px]">
                      <span className="font-bold text-yellowtext uppercase text-[11px] tracking-wide mr-1.5">
                        Allergies
                      </span>
                      {c.allergies}
                    </p>
                  )}
                  {c.special_needs && (
                    <p className="text-[13px]">
                      <span className="font-bold text-yellowtext uppercase text-[11px] tracking-wide mr-1.5">
                        Besoins
                      </span>
                      {c.special_needs}
                    </p>
                  )}
                </div>
              )}

              {c.authorized_pickups && c.authorized_pickups.length > 0 && (
                <div className="mt-3.5 pt-3.5 border-t border-border">
                  <div className="text-[11px] font-bold tracking-wide text-faint uppercase mb-1.5">
                    Personnes autorisées
                  </div>
                  <p className="text-[13px] text-soft">
                    {c.authorized_pickups.map((p) => p.full_name).join(", ")}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
