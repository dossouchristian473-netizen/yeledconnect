import { NextResponse } from "next/server";
import { createClient, getUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeAge } from "@/lib/age";

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const childId = body?.childId as string | undefined;
  const identifiant = body?.identifiant as string | undefined;
  const password = body?.password as string | undefined;

  if (!childId || !identifiant || !password) {
    return NextResponse.json({ error: "Champs manquants." }, { status: 400 });
  }

  const cleanIdentifiant = identifiant.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
  if (cleanIdentifiant.length < 3) {
    return NextResponse.json(
      { error: "Identifiant invalide (3 caractères minimum : lettres, chiffres, points, tirets)." },
      { status: 400 }
    );
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Mot de passe trop court (6 caractères minimum)." }, { status: 400 });
  }

  const supabase = createClient();

  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  const isAdmin = roles?.some((r) => r.role === "administrateur");
  if (!isAdmin) {
    return NextResponse.json({ error: "Seul un administrateur peut créer un compte ado." }, { status: 403 });
  }

  const { data: child } = await supabase
    .from("children")
    .select("id, date_of_birth, ado_user_id")
    .eq("id", childId)
    .maybeSingle();

  if (!child) return NextResponse.json({ error: "Enfant introuvable." }, { status: 404 });

  if (child.ado_user_id) {
    return NextResponse.json({ error: "Un compte ado existe déjà pour cet enfant." }, { status: 409 });
  }

  const age = computeAge(child.date_of_birth);
  if (age === null || age < 11) {
    return NextResponse.json({ error: "L'enfant doit avoir au moins 11 ans." }, { status: 400 });
  }

  const admin = createAdminClient();
  const email = `${cleanIdentifiant}@yeledconnect.local`;

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createErr || !created.user) {
    if (createErr?.status === 422 || createErr?.message?.toLowerCase().includes("already")) {
      return NextResponse.json({ error: "Cet identifiant est déjà utilisé." }, { status: 409 });
    }
    return NextResponse.json({ error: "Impossible de créer le compte." }, { status: 500 });
  }

  const { error: linkErr } = await admin.from("children").update({ ado_user_id: created.user.id }).eq("id", childId);

  if (linkErr) {
    await admin.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: "Impossible de lier le compte à la fiche." }, { status: 500 });
  }

  return NextResponse.json({ identifiant: cleanIdentifiant });
}
