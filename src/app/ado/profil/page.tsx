import { createClient, getUser } from "@/lib/supabase/server";
import { SubpageHeader } from "@/components/SubpageHeader";
import { LogoutButton } from "@/components/LogoutButton";

export default async function AdoProfilPage() {
  const supabase = createClient();
  const user = await getUser();

  const { data: profile } = await supabase.from("profiles").select("username").eq("id", user!.id).single();

  return (
    <div>
      <SubpageHeader title="Mon profil" backHref="/ado/exercices" />
      <div className="px-6">
        <div className="bg-card rounded-lg2 shadow-card p-[22px] flex items-center gap-3.5">
          <div className="w-[52px] h-[52px] rounded-full bg-teal-bg flex-shrink-0" aria-hidden />
          <div>
            <div className="font-bold text-[17px]">{profile?.username}</div>
            <div className="text-faint text-[13.5px] mt-0.5">Espace Ados</div>
          </div>
        </div>

        <div className="mt-[18px] bg-card rounded-lg2 shadow-card overflow-hidden">
          <LogoutButton variant="row" />
        </div>

        <div className="text-center text-faint text-[11.5px] font-bold tracking-[0.14em] my-6">YELEDCONNECT</div>
      </div>
    </div>
  );
}
