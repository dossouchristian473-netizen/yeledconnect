import { createClient, getUser } from "@/lib/supabase/server";
import { HeroBanner } from "@/components/home/HeroBanner";
import { ClassesSection } from "@/components/home/ClassesSection";
import { EventsSection } from "@/components/home/EventsSection";
import { PhotosSection } from "@/components/home/PhotosSection";
import { NewsSection } from "@/components/home/NewsSection";
import { ResourcesSection } from "@/components/home/ResourcesSection";

// Écran "Accueil" partagé : même contenu pour les 5 espaces (Parent,
// Moniteur, Accueil, Responsable, Administrateur). À ne pas confondre avec
// l'espace "Accueil" (rôle réception/check-in) — ce hub n'a rien à voir
// avec ce rôle, il est juste affiché depuis l'onglet "Accueil" de chaque
// espace. Édition réservée à Responsable/Administrateur (appliqué en RLS
// sur chaque table, `canEdit` ici ne fait que cacher les contrôles).
export async function HomeHub() {
  const supabase = createClient();
  const user = await getUser();

  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user!.id);
  const canEdit = roles?.some((r) => r.role === "responsable" || r.role === "administrateur") ?? false;

  return (
    // Le hub casse volontairement la contrainte max-w-[560px] du layout
    // parent (commune à tout le reste de l'espace) pour occuper la largeur
    // de l'écran sur desktop : technique "full-bleed" classique (left/right
    // 50% + marges négatives égales), puis un conteneur interne qui
    // recentre le contenu avec son propre plafond, plus large.
    <div className="relative left-1/2 right-1/2 w-screen -mx-[50vw]">
      <div className="max-w-[1180px] mx-auto flex flex-col gap-7 pb-4">
        <HeroBanner />
        <ClassesSection />
        <div className="px-6 grid grid-cols-1 min-[480px]:grid-cols-2 gap-6">
          <EventsSection canEdit={canEdit} />
          <PhotosSection canEdit={canEdit} />
        </div>
        <div className="px-6 grid grid-cols-1 min-[480px]:grid-cols-2 gap-6">
          <NewsSection canEdit={canEdit} />
          <ResourcesSection canEdit={canEdit} />
        </div>
      </div>
    </div>
  );
}
