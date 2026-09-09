import Link from "next/link";
import { createClient, getUser } from "@/lib/supabase/server";
import { getChildPhotoUrls } from "@/lib/supabase/childPhoto";
import { SubpageHeader } from "@/components/SubpageHeader";
import { ChildAvatar } from "@/components/ChildAvatar";

export default async function EnfantsPage() {
  const supabase = createClient();
  const user = await getUser();

  const { data: family } = await supabase
    .from("families")
    .select("id")
    .eq("parent_id", user!.id)
    .maybeSingle();

  const { data: children } = family
    ? await supabase
        .from("children")
        .select("id, first_name, date_of_birth, photo_url")
        .eq("family_id", family.id)
    : { data: [] as { id: string; first_name: string; date_of_birth: string | null; photo_url: string | null }[] };

  const photoUrls = await getChildPhotoUrls(supabase, children ?? []);

  if (!children || children.length === 0) {
    return (
      <div>
        <SubpageHeader title="Mes enfants" />
        <div className="flex flex-col items-center text-center px-8 pt-12">
          <div className="w-[150px] h-[120px] mb-6" aria-hidden />
          <h2 className="text-[22px] font-semibold mb-3">Mes enfants</h2>
          <p className="text-soft text-[14.5px] leading-relaxed max-w-[340px]">
            Ajoutez un enfant depuis Ma famille pour le voir apparaître ici, avec sa
            salle, ses présences et ses informations importantes.
          </p>
          <Link
            href="/onboarding"
            className="mt-6 inline-block rounded-full bg-blue-bg text-blue-dark font-bold text-[12px] tracking-wide px-[18px] py-[9px]"
          >
            AJOUTER UN ENFANT
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SubpageHeader title="Mes enfants" />
      <div className="px-6 pt-5 flex flex-col gap-3.5">
        {children.map((c) => (
          <Link
            key={c.id}
            href={`/enfants/${c.id}`}
            className="bg-card rounded-md2 shadow-card p-[18px] flex items-center gap-3.5"
          >
            <ChildAvatar photoUrl={photoUrls[c.id]} firstName={c.first_name} size={48} />
            <div>
              <div className="font-bold text-[15.5px]">{c.first_name}</div>
              <div className="text-faint text-[12.5px] mt-0.5">Né(e) le {c.date_of_birth ?? "—"}</div>
            </div>
          </Link>
        ))}
        <Link
          href="/onboarding"
          className="flex items-center justify-center gap-2 border-[1.5px] border-dashed border-[#c7d3e0] rounded-md2 py-4 text-blue-dark font-semibold text-[14.5px]"
        >
          + Ajouter un enfant
        </Link>
      </div>
    </div>
  );
}
