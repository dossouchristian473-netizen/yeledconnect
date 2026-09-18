import { createClient } from "@/lib/supabase/server";
import { DeleteRowButton } from "@/components/DeleteRowButton";
import { SectionEditToggle } from "@/components/home/SectionEditToggle";
import { NewsAddForm } from "@/components/home/NewsAddForm";
import { NewsItemContent } from "@/components/home/NewsItemContent";

export async function NewsSection({ canEdit }: { canEdit: boolean }) {
  const supabase = createClient();

  const { data: news } = await supabase
    .from("news_posts")
    .select("id, title, content")
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <section id="nouvelles" className="scroll-mt-24">
      <h2 className="text-[16.5px] font-semibold mb-3">Nouvelles d&apos;IJ</h2>

      {!news || news.length === 0 ? (
        <p className="text-soft text-[13.5px]">Aucune nouvelle pour le moment.</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {news.map((n) => (
            <div key={n.id} className="bg-card rounded-md2 shadow-card p-[14px] flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-bold text-[13.5px]">{n.title}</div>
                <NewsItemContent content={n.content} />
              </div>
              {canEdit && <DeleteRowButton table="news_posts" id={n.id} />}
            </div>
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
