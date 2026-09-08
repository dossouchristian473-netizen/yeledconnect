// Sans types Database générés, supabase-js type toujours une relation jointe
// comme un tableau, mais renvoie en réalité un objet unique pour une relation
// plusieurs-vers-un (ex: children.current_room_id -> rooms.id). Ce helper
// gère les deux formes possibles au runtime.
export function unwrapOne<T>(relation: T | T[] | null | undefined): T | null {
  if (Array.isArray(relation)) return relation[0] ?? null;
  return relation ?? null;
}
