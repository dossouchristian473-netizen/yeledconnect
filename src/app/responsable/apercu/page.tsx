import Link from "next/link";
import { createClient, getUser } from "@/lib/supabase/server";
import { Logo } from "@/components/Logo";
import { LogoutButton } from "@/components/LogoutButton";
import { UnreadBadge } from "@/components/UnreadBadge";

export default async function ResponsableApercuPage() {
  const supabase = createClient();
  const user = await getUser();

  const today = new Date().toISOString().slice(0, 10);

  const [
    { data: profile },
    { count: familiesCount },
    { count: childrenCount },
    { data: rooms },
    { data: attendanceToday },
    { data: children },
    { data: upcomingEvents },
    { data: allBirthdays },
  ] = await Promise.all([
    supabase.from("profiles").select("username").eq("id", user!.id).single(),
    supabase.from("families").select("id", { count: "exact", head: true }),
    supabase.from("children").select("id", { count: "exact", head: true }),
    supabase.from("rooms").select("id, name, capacity").order("name"),
    supabase.from("attendance").select("id, room_id, checked_in_at, checked_out_at").eq("sunday_date", today),
    supabase.from("children").select("id, current_room_id"),
    supabase
      .from("events")
      .select("id, title, event_date")
      .gte("event_date", today)
      .order("event_date", { ascending: true })
      .limit(3),
    supabase.from("children").select("id, first_name, date_of_birth").not("date_of_birth", "is", null),
  ]);

  const presentTotal = attendanceToday?.filter((a) => a.checked_in_at && !a.checked_out_at).length ?? 0;

  const now = new Date();

  const birthdaysThisMonth = (allBirthdays ?? [])
    .filter((c) => new Date(c.date_of_birth as string).getUTCMonth() === now.getUTCMonth())
    .map((c) => {
      const dob = new Date(c.date_of_birth as string);
      const turning = now.getUTCFullYear() - dob.getUTCFullYear();
      return { ...c, day: dob.getUTCDate(), turning };
    })
    .sort((a, b) => a.day - b.day);

  return (
    <div>
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <Logo />
        <LogoutButton />
      </div>

      <div className="px-6 pt-4">
        <h1 className="text-[26px] leading-tight font-semibold">Bonjour {profile?.username ?? ""} 👋</h1>
        <p className="mt-1 text-soft text-[14.5px]">Vue d&apos;ensemble du ministère des enfants.</p>
      </div>

      <div className="px-6 pt-4 grid grid-cols-2 gap-3.5">
        <StatCard label="Familles" value={familiesCount ?? 0} />
        <StatCard label="Enfants inscrits" value={childrenCount ?? 0} />
        <StatCard label="Présents aujourd'hui" value={presentTotal} accent />
        <StatCard label="Salles" value={rooms?.length ?? 0} />
      </div>

      <div className="px-6 pt-4">
        <Link
          href="/responsable/messages"
          className="flex items-center justify-between bg-card rounded-md2 shadow-card px-[18px] py-3.5 text-[14px] font-semibold text-blue-dark"
        >
          <span className="flex items-center gap-2">
            Messagerie
            <UnreadBadge userId={user!.id} inline />
          </span>
          <svg viewBox="0 0 24 24" fill="none" className="w-[15px] h-[15px]">
            <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>

      <div className="px-6 pt-5">
        <h3 className="text-[15.5px] font-semibold mb-3">Occupation des salles</h3>
        {!rooms || rooms.length === 0 ? (
          <p className="text-soft text-[14px]">Aucune salle créée pour le moment.</p>
        ) : (
          <div className="bg-card rounded-lg2 shadow-card p-[18px] flex flex-col gap-4">
            {rooms.map((room) => {
              const enrolled = children?.filter((c) => c.current_room_id === room.id).length ?? 0;
              const present =
                attendanceToday?.filter(
                  (a) => a.room_id === room.id && a.checked_in_at && !a.checked_out_at
                ).length ?? 0;
              const pct = room.capacity ? Math.min(100, Math.round((present / room.capacity) * 100)) : 0;
              return (
                <div key={room.id}>
                  <div className="flex items-center justify-between text-[13.5px] mb-1.5">
                    <span className="font-semibold">{room.name}</span>
                    <span className="text-faint">
                      {present}/{room.capacity ?? "?"} · {enrolled} inscrit{enrolled > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="h-[7px] bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-blue-dark rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="px-6 pt-5">
        <h3 className="text-[15.5px] font-semibold mb-3">Anniversaires du mois</h3>
        {birthdaysThisMonth.length === 0 ? (
          <p className="text-soft text-[14px]">Aucun anniversaire ce mois-ci.</p>
        ) : (
          <div className="bg-card rounded-lg2 shadow-card p-[18px] flex flex-col gap-3.5">
            {birthdaysThisMonth.map((c) => (
              <div key={c.id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-yellowbg flex items-center justify-center flex-shrink-0 text-[16px]">
                  🎂
                </div>
                <div>
                  <span className="font-bold text-[14.5px]">{c.first_name}</span>
                  <span className="text-soft text-[13.5px]"> fête ses {c.turning} ans le {c.day}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-6 pt-5">
        <h3 className="text-[15.5px] font-semibold mb-3">Prochains événements</h3>
        {!upcomingEvents || upcomingEvents.length === 0 ? (
          <p className="text-soft text-[14px]">Aucun événement à venir.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {upcomingEvents.map((e) => (
              <div key={e.id} className="bg-card rounded-md2 shadow-card p-[16px]">
                <div className="text-faint text-[12px] font-semibold mb-0.5">
                  {new Date(e.event_date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                </div>
                <div className="font-bold text-[14.5px]">{e.title}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="bg-card rounded-lg2 shadow-card p-[18px]">
      <div className={`text-[26px] font-bold ${accent ? "text-teal-dark" : "text-ink"}`}>{value}</div>
      <div className="text-faint text-[12px] font-semibold mt-0.5">{label}</div>
    </div>
  );
}
