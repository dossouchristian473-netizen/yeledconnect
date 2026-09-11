// Catégories de contenu texte libre (type = 'texte'), pour étiqueter plus
// précisément ce qui est proposé aux classes des petits — chants, poèmes,
// versets — plutôt que d'ajouter un nouveau "type" de stockage : ce sont
// toutes des variantes de texte libre, seule l'étiquette change.
export const CONTENT_CATEGORIES = [
  { value: "devoir", label: "Devoir / activité" },
  { value: "chant", label: "Chant à apprendre" },
  { value: "poeme", label: "Poème" },
  { value: "verset", label: "Verset" },
  { value: "activite", label: "Activité" },
] as const;

export type ContentCategory = (typeof CONTENT_CATEGORIES)[number]["value"];

export function contentCategoryLabel(category: string | null | undefined): string {
  return CONTENT_CATEGORIES.find((c) => c.value === category)?.label ?? "Texte";
}

// Étiquette courte affichée en badge dans les listes d'exercices.
export function exerciseTypeBadge(type: string, contentCategory?: string | null): string {
  if (type === "pdf") return "PDF";
  if (type === "quiz") return "Quiz";
  if (contentCategory && contentCategory !== "devoir") {
    return contentCategoryLabel(contentCategory);
  }
  return "Texte";
}
