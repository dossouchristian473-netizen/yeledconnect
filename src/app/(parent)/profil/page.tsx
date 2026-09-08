import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SubpageHeader } from "@/components/SubpageHeader";
import { LogoutButton } from "@/components/LogoutButton";
import { SpaceSwitcher } from "@/components/SpaceSwitcher";
import type { AppRole } from "@/lib/roles";

export default async function ProfilPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user!.id)
    .single();

  const { data: family } = await supabase
    .from("families")
    .select("family_name")
    .eq("parent_id", user!.id)
    .maybeSingle();

  // Rôles réels de la base (peut en contenir plusieurs : ex. parent + moniteur).
  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user!.id);

  return (
    <div>
      <SubpageHeader title="Mon profil" />
      <div className="px-6">
        <div className="bg-card rounded-lg2 shadow-card p-[22px] flex flex-col gap-3.5">
          <div className="flex items-center gap-3.5">
            <div className="w-[52px] h-[52px] rounded-full bg-blue-bg flex-shrink-0" aria-hidden />
            <div>
              <div className="font-bold text-[17px]">{profile?.username}</div>
              <div className="text-faint text-[13.5px] mt-0.5">
                {family ? `Famille ${family.family_name}` : "Sans famille"}
              </div>
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

        <div className="mt-[18px] bg-card rounded-lg2 shadow-card overflow-hidden">
          <Link
            href="/onboarding"
            className="flex items-center gap-3.5 w-full px-[22px] py-[18px] text-[15px] font-semibold border-b border-border"
          >
            <FamilyIcon /> Ma famille
          </Link>
          <LogoutButton variant="row" />
        </div>

        <SpaceSwitcher roles={(roles?.map((r) => r.role) as AppRole[]) ?? []} current="parent" />

        <div className="text-center text-faint text-[11.5px] font-bold tracking-[0.14em] my-6">
          YELEDCONNECT
        </div>
      </div>
    </div>
  );
}

function FamilyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-[19px] h-[19px] flex-shrink-0">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M2.5 20c.6-3.6 2.9-5.6 5.5-5.6s4.9 2 5.5 5.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M14.5 20c.4-2.6 1.9-4.2 3.9-4.2 1.7 0 3.1 1.1 3.6 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
