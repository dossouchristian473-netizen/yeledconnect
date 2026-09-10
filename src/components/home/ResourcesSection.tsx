import { createClient } from "@/lib/supabase/server";
import { DeleteRowButton } from "@/components/DeleteRowButton";
import { SectionEditToggle } from "@/components/home/SectionEditToggle";
import { ResourceAddForm } from "@/components/home/ResourceAddForm";
import { getYouTubeId } from "@/lib/youtube";

export async function ResourcesSection({ canEdit }: { canEdit: boolean }) {
  const supabase = createClient();

  const { data: resources } = await supabase
    .from("spiritual_resources")
    .select("id, title, description, url, resource_type")
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <section id="ressources" className="scroll-mt-24">
      <h2 className="text-[16.5px] font-semibold mb-3">Aide spirituelle</h2>

      {!resources || resources.length === 0 ? (
        <p className="text-soft text-[13.5px]">Aucune ressource pour le moment.</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {resources.map((r) => {
            const youtubeId = r.resource_type === "video" ? getYouTubeId(r.url) : null;
            return (
              <a
                key={r.id}
                href={r.url}
                target="_blank"
                rel="noreferrer"
                className="bg-card rounded-md2 shadow-card p-[14px] flex items-center gap-3"
              >
                {youtubeId ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
                    alt=""
                    className="w-[68px] h-[48px] rounded-md2 object-cover flex-shrink-0"
                  />
                ) : (
                  <span className="w-[68px] h-[48px] rounded-md2 bg-blue-bg flex items-center justify-center text-[20px] flex-shrink-0">
                    🔗
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-[13.5px] truncate">{r.title}</div>
                  {r.description && <p className="text-soft text-[12px] mt-0.5 line-clamp-2">{r.description}</p>}
                </div>
                {canEdit && (
                  <div onClick={(e) => e.preventDefault()}>
                    <DeleteRowButton table="spiritual_resources" id={r.id} />
                  </div>
                )}
              </a>
            );
          })}
        </div>
      )}

      {canEdit && (
        <SectionEditToggle label="+ Ajouter une ressource">
          <ResourceAddForm />
        </SectionEditToggle>
      )}
    </section>
  );
}
