import { NextResponse } from "next/server";
import { createClient, getUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { unwrapOne } from "@/lib/supabase/one";

type Family = { parent_id: string };

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const childId = body?.childId as string | undefined;
  const password = body?.password as string | undefined;

  if (!childId || !password) {
    return NextResponse.json({ error: "Champs manquants." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Mot de passe trop court (6 caractères minimum)." }, { status: 400 });
  }

  const supabase = createClient();

  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  const isAdmin = roles?.some((r) => r.role === "administrateur");

  const { data: child } = await supabase
    .from("children")
    .select("id, ado_user_id, family:family_id(parent_id)")
    .eq("id", childId)
    .maybeSingle();

  if (!child) return NextResponse.json({ error: "Enfant introuvable." }, { status: 404 });

  const family = unwrapOne<Family>(child.family);
  const isOwnParent = family?.parent_id === user.id;
  if (!isAdmin && !isOwnParent) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }

  if (!child.ado_user_id) {
    return NextResponse.json({ error: "Aucun compte ado pour cet enfant." }, { status: 404 });
  }

  const admin = createAdminClient();
  const { error: updateErr } = await admin.auth.admin.updateUserById(child.ado_user_id, { password });

  if (updateErr) {
    return NextResponse.json({ error: "Impossible de réinitialiser le mot de passe." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
