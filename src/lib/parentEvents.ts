import type { SupabaseClient } from "@supabase/supabase-js";

// Un parent ne voit que les événements ouverts à toutes les classes
// (room_id null) et ceux des classes de ses enfants.
export async function getParentEventRoomIds(supabase: SupabaseClient, userId: string): Promise<string[]> {
  const { data: family } = await supabase.from("families").select("id").eq("parent_id", userId).maybeSingle();
  if (!family) return [];

  const { data: children } = await supabase.from("children").select("current_room_id").eq("family_id", family.id);
  return Array.from(
    new Set((children ?? []).map((c) => c.current_room_id).filter((id): id is string => !!id))
  );
}

export function parentEventsFilter(roomIds: string[]): string {
  return roomIds.length > 0 ? `room_id.is.null,room_id.in.(${roomIds.join(",")})` : "room_id.is.null";
}
