import { NextResponse } from "next/server";
import { createClient, getUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const childId = body?.childId as string | undefined;
  const identifiant = body?.identifiant as string | undefined;
  const password = body?.password as string | undefined;

  if (!childId || (!identifiant && !password)) {
    return NextResponse.json({ error: "Champs manquants." }, { status: 400 });
  }

  let cleanIdentifiant: string | undefined;
  if (identifiant) {
    cleanIdentifiant = identifiant.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
    if (cleanIdentifiant.length < 3) {
      return NextResponse.json(
        { error: "Identifiant invalide (3 caractères minimum : lettres, chiffres, points, tirets)." },
        { status: 400 }
      );
    }
  }
  if (password && password.length < 6) {
    return NextResponse.json({ error: "Mot de passe trop court (6 caractères minimum)." }, { status: 400 });
  }

  const supabase = createClient();

  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  const isAdmin = roles?.some((r) => r.role === "administrateur");
  if (!isAdmin) {
    return NextResponse.json({ error: "Seul un administrateur peut modifier ce compte ado." }, { status: 403 });
  }

  const { data: child } = await supabase
    .from("children")
    .select("id, ado_user_id")
    .eq("id", childId)
    .maybeSingle();

  if (!child) return NextResponse.json({ error: "Enfant introuvable." }, { status: 404 });
  if (!child.ado_user_id) {
    return NextResponse.json({ error: "Aucun compte ado pour cet enfant." }, { status: 404 });
  }

  const admin = createAdminClient();

  const updates: { email?: string; password?: string } = {};
  if (cleanIdentifiant) updates.email = `${cleanIdentifiant}@yeledconnect.local`;
  if (password) updates.password = password;

  const { error: updateErr } = await admin.auth.admin.updateUserById(child.ado_user_id, updates);

  if (updateErr) {
    if (updateErr.status === 422 || updateErr.message?.toLowerCase().includes("already")) {
      return NextResponse.json({ error: "Cet identifiant est déjà utilisé." }, { status: 409 });
    }
    return NextResponse.json({ error: "Impossible de modifier le compte." }, { status: 500 });
  }

  // Le trigger qui dérive profiles.username depuis l'email ne se déclenche
  // qu'à la création du compte (insert sur auth.users), pas à la mise à
  // jour — il faut donc synchroniser manuellement ici si l'identifiant a
  // changé.
  if (cleanIdentifiant) {
    await admin.from("profiles").update({ username: cleanIdentifiant }).eq("id", child.ado_user_id);
  }

  return NextResponse.json({ identifiant: cleanIdentifiant });
}
