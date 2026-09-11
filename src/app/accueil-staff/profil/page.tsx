import { createClient, getUser } from "@/lib/supabase/server";
import { SubpageHeader } from "@/components/SubpageHeader";
import { LogoutButton } from "@/components/LogoutButton";
import { SpaceSwitcher } from "@/components/SpaceSwitcher";
import { ProfileEditForm } from "@/components/ProfileEditForm";
import type { AppRole } from "@/lib/roles";

export default async function AccueilProfilPage() {
  const supabase = createClient();
  const user = await getUser();

  // Rôles réels de la base (peut en contenir plusieurs : ex. parent + accueil).
  const [{ data: profile }, { data: roles }] = await Promise.all([
    supabase.from("profiles").select("username, first_name, last_name, phone").eq("id", user!.id).single(),
    supabase.from("user_roles").select("role").eq("user_id", user!.id),
  ]);

  return (
    <div>
      <SubpageHeader title="Mon profil" backHref="/accueil-staff/recherche" />
      <div className="px-6">
        <div className="bg-card rounded-lg2 shadow-card p-[22px] flex flex-col gap-3.5">
          <div className="flex items-center gap-3.5">
            <div className="w-[52px] h-[52px] rounded-full bg-blue-bg flex-shrink-0" aria-hidden />
            <div>
              <div className="font-bold text-[17px]">{profile?.username}</div>
              <div className="text-faint text-[13.5px] mt-0.5">Équipe Accueil</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {roles?.map((r) => (
              <span
                key={r.role}
                className="bg-blue-bg text-blue-dark font-bold text-[12px] tracking-wide px-4 py-[7px] rounded-full uppercase"
              >
                {r.role}
              </span>
            ))}
          </div>
        </div>

        <ProfileEditForm
          userId={user!.id}
          initialFirstName={profile?.first_name ?? null}
          initialLastName={profile?.last_name ?? null}
          initialPhone={profile?.phone ?? null}
          initialEmail={user!.email!}
        />

        <div className="mt-[18px] bg-card rounded-lg2 shadow-card overflow-hidden">
          <LogoutButton variant="row" />
        </div>

        <SpaceSwitcher roles={(roles?.map((r) => r.role) as AppRole[]) ?? []} current="accueil" />

        <div className="text-center text-faint text-[11.5px] font-bold tracking-[0.14em] my-6">
          YELEDCONNECT
        </div>
      </div>
    </div>
  );
}
