import Link from "next/link";
import { createClient, getUser } from "@/lib/supabase/server";
import { Logo } from "@/components/Logo";
import { LogoutButton } from "@/components/LogoutButton";

export default async function AccueilPage() {
  const supabase = createClient();
  const user = await getUser();

  const [{ data: profile }, { data: family }] = await Promise.all([
    supabase.from("profiles").select("username").eq("id", user!.id).single(),
    supabase.from("families").select("id, family_name").eq("parent_id", user!.id).maybeSingle(),
  ]);

  const { data: children } = family
    ? await supabase.from("children").select("id, first_name, date_of_birth").eq("family_id", family.id)
    : { data: [] as { id: string; first_name: string; date_of_birth: string | null }[] };

  return (
    <div>
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <Logo />
        <LogoutButton />
      </div>

      <div className="px-6 pt-4">
        <h1 className="text-[28px] leading-tight font-semibold">
          Bonjour {profile?.username ?? ""} 👋
        </h1>
        <p className="mt-1.5 text-soft text-[15px]">
          {family ? "Voici l'espace de votre famille." : "Prêt·e pour la rencontre du jour ?"}
        </p>
      </div>

      {!family ? (
        <div className="mx-6 mt-5 bg-blue-bg rounded-lg2 p-[22px] flex gap-4">
          <div className="w-[52px] h-[52px] flex-shrink-0" aria-hidden />
          <div>
            <h3 className="text-[17px] font-semibold mb-1.5">Créons votre espace famille</h3>
            <p className="text-soft text-[14px] leading-relaxed">
              Ajoutez vos coordonnées et vos enfants — 2 minutes.
            </p>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-1.5 mt-3.5 rounded-full bg-blue-dark text-white font-bold text-[14.5px] px-5 py-2.5 shadow-[0_10px_18px_-8px_rgba(44,134,204,0.5)]"
            >
              Commencer
              <svg viewBox="0 0 24 24" fill="none" className="w-[15px] h-[15px]">
                <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      ) : (
        <div className="mx-6 mt-5 bg-card rounded-lg2 p-[22px] shadow-card">
          <h3 className="text-[17px] font-semibold mb-1">Famille {family.family_name}</h3>
          <p className="text-soft text-[14px]">
            {children?.length ?? 0} enfant{(children?.length ?? 0) > 1 ? "s" : ""} enregistré
            {(children?.length ?? 0) > 1 ? "s" : ""}
          </p>
          {children?.map((c) => (
            <div key={c.id} className="flex items-center gap-3 mt-4 pt-4 border-t border-border first:border-0 first:pt-0">
              <div className="w-[38px] h-[38px] rounded-full bg-gradient-to-br from-[#8ec9f5] to-[#5fa8e6] text-white flex items-center justify-center font-bold text-[14px]">
                {c.first_name[0]?.toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-[14.5px]">{c.first_name}</div>
                <div className="text-faint text-[12.5px]">Né(e) le {c.date_of_birth ?? "—"}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
