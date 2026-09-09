import { cache } from "react";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Appelé depuis un Server Component : ignoré si le middleware
            // rafraîchit déjà la session.
          }
        },
      },
    }
  );
}

// Mémorisé par requête (React.cache) : le layout ET la page appellent tous les
// deux getUser() pour la même navigation. Sans ce cache, chaque appel refait
// un aller-retour réseau vers le serveur Auth de Supabase — ici, un seul
// aller-retour est fait et sa réponse est réutilisée partout dans la requête.
export const getUser = cache(async () => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
