"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function MoniteurRoomAssign({
  userId,
  rooms,
  currentRoomId,
}: {
  userId: string;
  rooms: { id: string; name: string }[];
  currentRoomId: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleChange(roomId: string) {
    setLoading(true);
    // Simplifie à une seule salle "principale" par moniteur : on remplace
    // l'affectation existante plutôt que d'en gérer plusieurs en parallèle.
    await supabase.from("moniteur_rooms").delete().eq("moniteur_id", userId);
    if (roomId) {
      await supabase.from("moniteur_rooms").insert({ moniteur_id: userId, room_id: roomId });
    }
    router.refresh();
    setLoading(false);
  }

  return (
    <select
      value={currentRoomId ?? ""}
      onChange={(e) => handleChange(e.target.value)}
      disabled={loading}
      className="border border-border rounded-full px-3.5 py-[7px] text-[12.5px] font-semibold bg-white disabled:opacity-60"
    >
      <option value="">Aucune salle</option>
      {rooms.map((r) => (
        <option key={r.id} value={r.id}>
          {r.name}
        </option>
      ))}
    </select>
  );
}
