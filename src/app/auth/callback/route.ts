import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Point d'arrivée du flux OAuth (ex: Google) et des liens magiques envoyés
// par email. Échange le "code" contre une session côté serveur (PKCE) avant
// de rediriger — sans cette étape, le code renvoyé par le fournisseur est
// simplement ignoré et l'utilisateur n'est jamais authentifié.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth`);
}
