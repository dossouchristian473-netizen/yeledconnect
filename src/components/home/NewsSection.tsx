import { createClient } from "@/lib/supabase/server";
import { SectionEditToggle } from "@/components/home/SectionEditToggle";
import { NewsAddForm } from "@/components/home/NewsAddForm";
import { NewsItemCard } from "@/components/home/NewsItemCard";

export async function NewsSection({ canEdit }: { canEdit: boolean }) {
  const supabase = createClient();

  const { data: news } = await supabase
    .from("news_posts")
    .select("id, title, content, image_path")
    .order("created_at", { ascending: false })
    .limit(6);

  const items = (news ?? []).map((n) => ({
    ...n,
    imageUrl: n.image_path ? supabase.storage.from("home-photos").getPublicUrl(n.image_path).data.publicUrl : null,
  }));

  return (
    <section id="nouvelles" className="scroll-mt-24">
      <h2 className="text-[16.5px] font-semibold mb-3">Nouvelles d&apos;IJ</h2>

      {items.length === 0 ? (
        <p className="text-soft text-[13.5px]">Aucune nouvelle pour le moment.</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {items.map((n) => (
            <NewsItemCard key={n.id} item={n} canEdit={canEdit} />
          ))}
        </div>
      )}

      {canEdit && (
        <SectionEditToggle label="+ Ajouter une nouvelle">
          <NewsAddForm />
        </SectionEditToggle>
      )}
    </section>
  );
}
