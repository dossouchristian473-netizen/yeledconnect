// Les 4 classes d'âge de référence (voir la migration "Identité visuelle
// v2" dans supabase/schema.sql). Utilisé pour proposer des préréglages à la
// création d'une salle — la couleur/icône réellement affichée pour une
// salle existante vient toujours de rooms.color/rooms.icon, jamais de cette
// liste, pour rester cohérent si une salle est renommée par la suite.
export const ROOM_CLASSES = [
  { name: "David", ageMin: 3, ageMax: 5, color: "#A7C7E7", icon: "shield" },
  { name: "Joseph", ageMin: 6, ageMax: 8, color: "#FFC9DE", icon: "star" },
  { name: "Gédéon", ageMin: 9, ageMax: 11, color: "#FFFACD", icon: "flame" },
  { name: "Daniel", ageMin: 12, ageMax: null, color: "#C1E1C1", icon: "crown" },
] as const;

export function formatAgeRange(ageMin: number | null, ageMax: number | null): string {
  if (ageMin == null && ageMax == null) return "Tous âges";
  if (ageMin != null && ageMax == null) return `${ageMin} ans et +`;
  if (ageMin == null && ageMax != null) return `Jusqu'à ${ageMax} ans`;
  return `${ageMin}-${ageMax} ans`;
}
