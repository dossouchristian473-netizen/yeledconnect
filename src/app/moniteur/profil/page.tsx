import { createClient, getUser } from "@/lib/supabase/server";
import { unwrapOne } from "@/lib/supabase/one";
import { SubpageHeader } from "@/components/SubpageHeader";
import { LogoutButton } from "@/components/LogoutButton";
import { SpaceSwitcher } from "@/components/SpaceSwitcher";
import { SharePhoneCard } from "@/components/SharePhoneCard";
import type { AppRole } from "@/lib/roles";

export default async function MoniteurProfilPage() {
  const supabase = createClient();
  const user = await getUser();

  // Rôles réels de la base (peut en contenir plusieurs : ex. parent + moniteur).
  const [{ data: profile }, { data: roles }, { data: assignments }] = await Promise.all([
    supabase.from("profiles").select("username, phone, share_phone_with_parents").eq("id", user!.id).single(),
    supabase.from("user_roles").select("role").eq("user_id", user!.id),
    supabase.from("moniteur_rooms").select("rooms(name)").eq("moniteur_id", user!.id),
  ]);

  const roomNames = (assignments ?? [])
    .map((a) => unwrapOne(a.rooms)?.name)
    .filter((n): n is string => !!n);

  return (
    <div>
      <SubpageHeader title="Mon profil" backHref="/moniteur/salle" />
      <div className="px-6">
        <div className="bg-card rounded-lg2 shadow-card p-[22px] flex flex-col gap-3.5">
          <div className="flex items-center gap-3.5">
            <div className="w-[52px] h-[52px] rounded-full bg-teal-bg flex-shrink-0" aria-hidden />
            <div>
              <div className="font-bold text-[17px]">{profile?.username}</div>
              <div className="text-faint text-[13.5px] mt-0.5">
                {roomNames.length ? roomNames.join(", ") : "Aucune salle assignée"}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {roles?.map((r) => (
              <span
                key={r.role}
                className="bg-teal-bg text-teal-dark font-bold text-[12px] tracking-wide px-4 py-[7px] rounded-full uppercase"
              >
                {r.role}
              </span>
            ))}
          </div>
        </div>

        <SharePhoneCard
          userId={user!.id}
          initialPhone={profile?.phone ?? null}
          initialShared={profile?.share_phone_with_parents ?? false}
        />

        <div className="mt-[18px] bg-card rounded-lg2 shadow-card overflow-hidden">
          <LogoutButton variant="row" />
        </div>

        <SpaceSwitcher roles={(roles?.map((r) => r.role) as AppRole[]) ?? []} current="moniteur" />

        <div className="text-center text-faint text-[11.5px] font-bold tracking-[0.14em] my-6">
          YELEDCONNECT
        </div>
      </div>
    </div>
  );
}
