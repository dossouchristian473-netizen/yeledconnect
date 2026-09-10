import type { SupabaseClient } from "@supabase/supabase-js";

// Petite table (4-5 lignes) : un select complet à chaque page qui affiche
// des avatars d'enfants est largement suffisant, pas besoin de cache.
export async function getRoomColorMap(supabase: SupabaseClient): Promise<Record<string, string>> {
  const { data } = await supabase.from("rooms").select("id, color");
  const map: Record<string, string> = {};
  (data ?? []).forEach((r) => {
    if (r.color) map[r.id] = r.color;
  });
  return map;
}
