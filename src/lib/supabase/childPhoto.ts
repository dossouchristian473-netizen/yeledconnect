import type { SupabaseClient } from "@supabase/supabase-js";

// Le bucket "child-photos" est privé : la seule façon d'afficher une photo
// est de générer une URL signée à durée limitée, jamais une URL publique.
export async function getChildPhotoUrl(
  supabase: SupabaseClient,
  photoPath: string | null | undefined
): Promise<string | null> {
  if (!photoPath) return null;
  const { data } = await supabase.storage.from("child-photos").createSignedUrl(photoPath, 3600);
  return data?.signedUrl ?? null;
}

export async function getChildPhotoUrls(
  supabase: SupabaseClient,
  children: { id: string; photo_url: string | null }[]
): Promise<Record<string, string>> {
  const withPhoto = children.filter((c) => c.photo_url);
  if (withPhoto.length === 0) return {};

  const results = await Promise.all(
    withPhoto.map((c) => supabase.storage.from("child-photos").createSignedUrl(c.photo_url!, 3600))
  );

  const map: Record<string, string> = {};
  withPhoto.forEach((c, i) => {
    const url = results[i].data?.signedUrl;
    if (url) map[c.id] = url;
  });
  return map;
}
