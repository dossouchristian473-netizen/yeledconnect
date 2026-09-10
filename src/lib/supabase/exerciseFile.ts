import type { SupabaseClient } from "@supabase/supabase-js";

// Le bucket "exercise-files" est privé (documents pédagogiques réservés aux
// comptes connectés) : on génère une URL signée à durée limitée, comme pour
// les photos d'enfants.
export async function getExerciseFileUrl(
  supabase: SupabaseClient,
  filePath: string | null | undefined
): Promise<string | null> {
  if (!filePath) return null;
  const { data } = await supabase.storage.from("exercise-files").createSignedUrl(filePath, 3600);
  return data?.signedUrl ?? null;
}
