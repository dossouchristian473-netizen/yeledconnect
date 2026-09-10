"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Un moniteur peut être affecté à plusieurs salles à la fois (la table
// moniteur_rooms le permet nativement) : on bascule chaque salle
// individuellement plutôt que de remplacer toute l'affectation à chaque
// changement, pour ne jamais écraser les autres salles déjà cochées.
export function MoniteurRoomAssign({
  userId,
  rooms,
  currentRoomIds,
}: {
  userId: string;
  rooms: { id: string; name: string }[];
  currentRoomIds: string[];
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function toggle(roomId: string, checked: boolean) {
    setLoading(true);
    if (checked) {
      await supabase.from("moniteur_rooms").insert({ moniteur_id: userId, room_id: roomId });
    } else {
      await supabase.from("moniteur_rooms").delete().eq("moniteur_id", userId).eq("room_id", roomId);
    }
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {rooms.map((r) => {
        const checked = currentRoomIds.includes(r.id);
        return (
          <label
            key={r.id}
            className={`flex items-center gap-1.5 rounded-full px-3 py-[6px] text-[12px] font-semibold border cursor-pointer ${
              checked ? "border-blue-dark bg-blue-bg text-blue-dark" : "border-border text-faint"
            } ${loading ? "opacity-60 pointer-events-none" : ""}`}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => toggle(r.id, e.target.checked)}
              className="w-3.5 h-3.5 accent-blue-dark"
            />
            {r.name}
          </label>
        );
      })}
    </div>
  );
}
