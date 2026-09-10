import { createClient } from "@/lib/supabase/server";
import { DeleteRowButton } from "@/components/DeleteRowButton";
import { SectionEditToggle } from "@/components/home/SectionEditToggle";
import { PhotoAddForm } from "@/components/home/PhotoAddForm";

export async function PhotosSection({ canEdit }: { canEdit: boolean }) {
  const supabase = createClient();

  const { data: photos } = await supabase
    .from("home_photos")
    .select("id, photo_path, caption")
    .order("created_at", { ascending: false })
    .limit(9);

  const items = (photos ?? []).map((p) => ({
    ...p,
    url: supabase.storage.from("home-photos").getPublicUrl(p.photo_path).data.publicUrl,
  }));

  return (
    <section id="photos" className="scroll-mt-24">
      <h2 className="text-[16.5px] font-semibold mb-3">Photos des enfants sur les cultes</h2>

      {items.length === 0 ? (
        <p className="text-soft text-[13.5px]">Aucune photo pour le moment.</p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {items.map((p) => (
            <div key={p.id} className="relative aspect-square rounded-md2 overflow-hidden bg-border group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={p.caption ?? ""} className="w-full h-full object-cover" />
              {canEdit && (
                <div className="absolute top-1 right-1">
                  <DeleteRowButton table="home_photos" id={p.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {canEdit && (
        <SectionEditToggle label="+ Ajouter une photo">
          <PhotoAddForm />
        </SectionEditToggle>
      )}
    </section>
  );
}
