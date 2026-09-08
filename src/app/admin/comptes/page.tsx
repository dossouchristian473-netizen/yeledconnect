import { createClient } from "@/lib/supabase/server";
import { APP_ROLES } from "@/lib/roles";
import { RoleToggle } from "@/components/RoleToggle";
import { MoniteurRoomAssign } from "@/components/MoniteurRoomAssign";
import { Logo } from "@/components/Logo";
import { LogoutButton } from "@/components/LogoutButton";

export default async function AdminComptesPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q?.trim() ?? "";
  const supabase = createClient();

  let profilesQuery = supabase.from("profiles").select("id, username").order("username");
  if (q) profilesQuery = profilesQuery.ilike("username", `%${q}%`);
  const { data: profiles } = await profilesQuery;

  const { data: allRoles } = await supabase.from("user_roles").select("user_id, role");
  const { data: rooms } = await supabase.from("rooms").select("id, name").order("name");
  const { data: moniteurRooms } = await supabase.from("moniteur_rooms").select("moniteur_id, room_id");

  function rolesFor(userId: string) {
    return allRoles?.filter((r) => r.user_id === userId).map((r) => r.role) ?? [];
  }
  function roomFor(userId: string) {
    return moniteurRooms?.find((mr) => mr.moniteur_id === userId)?.room_id ?? null;
  }

  return (
    <div>
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <Logo />
        <LogoutButton />
      </div>

      <div className="px-6 pt-4">
        <h1 className="text-[26px] leading-tight font-semibold">Comptes</h1>
        <p className="mt-1 text-soft text-[14.5px]">Gérez les rôles et les affectations de chaque compte.</p>
      </div>

      <form action="/admin/comptes" method="get" className="px-6 pt-3">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Rechercher un compte..."
          className="w-full border border-border bg-card rounded-full px-[18px] py-3.5 text-[15px] shadow-card"
        />
      </form>

      <div className="px-6 pt-5 flex flex-col gap-3.5">
        {(!profiles || profiles.length === 0) && (
          <p className="text-soft text-[14.5px] text-center pt-8">Aucun compte trouvé.</p>
        )}

        {profiles?.map((p) => {
          const userRoles = rolesFor(p.id);
          const isMoniteur = userRoles.includes("moniteur");
          return (
            <div key={p.id} className="bg-card rounded-lg2 shadow-card p-[18px]">
              <div className="font-bold text-[15.5px] mb-3">{p.username}</div>
              <div className="flex flex-wrap gap-2">
                {APP_ROLES.map((role) => (
                  <RoleToggle
                    key={role}
                    userId={p.id}
                    username={p.username}
                    role={role}
                    active={userRoles.includes(role)}
                  />
                ))}
              </div>

              {isMoniteur && (
                <div className="mt-3.5 pt-3.5 border-t border-border flex items-center gap-2.5">
                  <span className="text-[12px] font-semibold text-faint">Salle assignée :</span>
                  <MoniteurRoomAssign userId={p.id} rooms={rooms ?? []} currentRoomId={roomFor(p.id)} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
