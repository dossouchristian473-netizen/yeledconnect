import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Client "service role" : contourne la RLS. Réservé aux Route Handlers
// (jamais importé côté client) — chaque route l'utilisant doit vérifier
// elle-même les permissions de l'appelant avant d'agir, puisque ce client
// n'est plus filtré par les policies.
export function createAdminClient() {
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
