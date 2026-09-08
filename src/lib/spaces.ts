import type { AppRole } from "@/lib/roles";

export const SPACES: Record<AppRole, { label: string; href: string }> = {
  parent: { label: "Espace Parent", href: "/accueil" },
  moniteur: { label: "Espace Moniteur", href: "/moniteur/salle" },
  accueil: { label: "Espace Accueil", href: "/accueil-staff/recherche" },
  responsable: { label: "Espace Responsable", href: "/responsable/apercu" },
  administrateur: { label: "Espace Administrateur", href: "/admin/comptes" },
};
