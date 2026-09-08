import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function RootPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  const roleNames = roles?.map((r) => r.role) ?? [];

  if (roleNames.includes("parent")) redirect("/accueil");
  if (roleNames.includes("moniteur")) redirect("/moniteur/salle");
  if (roleNames.includes("accueil")) redirect("/accueil-staff/recherche");
  if (roleNames.includes("responsable")) redirect("/responsable/apercu");
  if (roleNames.includes("administrateur")) redirect("/admin/comptes");

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
