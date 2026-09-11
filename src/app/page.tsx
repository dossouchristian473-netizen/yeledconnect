import { redirect } from "next/navigation";
import { createClient, getUser } from "@/lib/supabase/server";

export default async function RootPage() {
  const supabase = createClient();
  const user = await getUser();

  if (!user) redirect("/auth");

  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  const roleNames = roles?.map((r) => r.role) ?? [];

  // Chaque espace atterrit d'abord sur son onglet "Accueil" (le hub
  // partagé), pas sur sa page fonctionnelle historique (Salle, Recherche,
  // Aperçu, Comptes) — celles-ci restent accessibles via la nav.
  if (roleNames.includes("parent")) redirect("/accueil");
  if (roleNames.includes("moniteur")) redirect("/moniteur/accueil");
  if (roleNames.includes("accueil")) redirect("/accueil-staff/accueil");
  if (roleNames.includes("responsable")) redirect("/responsable/accueil");
  if (roleNames.includes("administrateur")) redirect("/admin/accueil");
  if (roleNames.includes("ado")) redirect("/ado/exercices");

  // Compte authentifié mais sans rôle connu : on affiche un message plutôt que
  // de rediriger vers /auth, pour éviter une boucle avec le middleware (qui
  // renvoie tout utilisateur connecté loin de /auth).
  return (
    <div className="max-w-[560px] mx-auto min-h-screen flex flex-col items-center justify-center text-center px-8">
      <h1 className="text-[20px] font-semibold mb-2">Aucun rôle assigné</h1>
      <p className="text-soft text-[14.5px] leading-relaxed">
        Votre compte est connecté mais n&apos;a encore aucun rôle. Contactez un
        administrateur pour qu&apos;il vous en attribue un.
      </p>
    </div>
  );
}
