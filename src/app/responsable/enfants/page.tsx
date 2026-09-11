import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getChildPhotoUrls } from "@/lib/supabase/childPhoto";
import { getRoomColorMap } from "@/lib/supabase/roomColors";
import { unwrapOne } from "@/lib/supabase/one";
import { ChildAvatar } from "@/components/ChildAvatar";

export default async function ResponsableEnfantsPage({
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
    photo_url: string | null;
    current_room_id: string | null;
    families: { family_name: string } | { family_name: string }[] | null;
  };

  let query = supabase
    .from("children")
    .select("id, first_name, last_name, date_of_birth, photo_url, current_room_id, families(family_name)")
    .order("first_name")
    .limit(50);
  if (q) query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%`);

  const { data } = await query;
  const children = (data as ChildRow[] | null) ?? [];
  const [photoUrls, roomColors] = await Promise.all([
    getChildPhotoUrls(supabase, children),
    getRoomColorMap(supabase),
  ]);

  return (
    <div>
      <div className="px-6 pt-4">
        <h1 className="text-[26px] leading-tight font-semibold">Enfants</h1>
        <p className="mt-1 text-soft text-[14.5px]">Consultez la fiche de n&apos;importe quel enfant inscrit.</p>
      </div>

      <form action="/responsable/enfants" method="get" className="px-6 pt-3">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Prénom ou nom de l'enfant..."
          className="w-full border border-border bg-card rounded-full px-[18px] py-3.5 text-[15px] shadow-card"
        />
      </form>

      <div className="px-6 pt-5 flex flex-col gap-3.5">
        {children.length === 0 && (
          <p className="text-soft text-[14.5px] text-center pt-8">Aucun enfant trouvé.</p>
        )}

        {children.map((c) => {
          const family = unwrapOne<{ family_name: string }>(c.families);
          return (
            <Link
              key={c.id}
              href={`/responsable/enfants/${c.id}`}
              className="bg-card rounded-lg2 shadow-card p-[18px] flex items-center gap-3.5"
            >
              <ChildAvatar
                photoUrl={photoUrls[c.id]}
                firstName={c.first_name}
                size={48}
                color={c.current_room_id ? roomColors[c.current_room_id] : null}
              />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-[15.5px] truncate">
                  {c.first_name} {c.last_name ?? ""}
                </div>
                <div className="text-faint text-[12.5px] mt-0.5">
                  {family ? `Famille ${family.family_name} · ` : ""}Né(e) le {c.date_of_birth ?? "—"}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
