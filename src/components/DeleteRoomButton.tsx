"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Suppression spécifique aux salles : contrairement à DeleteRowButton
// (générique), on vérifie d'abord ce qui empêcherait la suppression pour
// afficher un message clair, plutôt que de laisser échouer silencieusement
// sur une contrainte de clé étrangère (enfants encore inscrits, historique
// de présences/événements). moniteur_rooms et exercises sont en `on delete
// cascade` en base, donc ne bloquent jamais : les affectations moniteur et
// les exercices de la salle disparaissent avec elle, ce qui est voulu.
export function DeleteRoomButton({ roomId }: { roomId: string }) {
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (!confirming) return;
    const t = setTimeout(() => setConfirming(false), 3000);
    return () => clearTimeout(t);
  }, [confirming]);

  async function handleClick() {
    if (!confirming) {
      setConfirming(true);
      setError(null);
      return;
    }
    setConfirming(false);
    setLoading(true);
    setError(null);

    const [{ count: childrenCount }, { count: attendanceCount }, { count: eventsCount }] = await Promise.all([
      supabase.from("children").select("id", { count: "exact", head: true }).eq("current_room_id", roomId),
      supabase.from("attendance").select("id", { count: "exact", head: true }).eq("room_id", roomId),
      supabase.from("events").select("id", { count: "exact", head: true }).eq("room_id", roomId),
    ]);

    if (childrenCount) {
      setError(
        `Réaffectez d'abord ${childrenCount > 1 ? `les ${childrenCount} enfants` : "l'enfant"} de cette salle avant de la supprimer.`
      );
      setLoading(false);
      return;
    }
    if (attendanceCount) {
      setError("Impossible : cette salle a un historique de présences enregistré.");
      setLoading(false);
      return;
    }
    if (eventsCount) {
      setError("Impossible : un événement de l'agenda est encore rattaché à cette salle.");
      setLoading(false);
      return;
    }

    const { error: deleteErr } = await supabase.from("rooms").delete().eq("id", roomId);
    setLoading(false);
    if (deleteErr) {
      setError("Impossible de supprimer cette salle.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        aria-label={confirming ? "Confirmer la suppression" : "Supprimer"}
        className={`h-9 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-60 ${
          confirming ? "px-3.5 bg-danger text-white font-bold text-[11px] tracking-wide uppercase" : "w-9 bg-[#fbeaea] text-danger"
        }`}
      >
        {confirming ? (
          "Confirmer ?"
        ) : (
          <svg viewBox="0 0 24 24" fill="none" className="w-[16px] h-[16px]">
            <path
              d="M5 6.5h14M9.5 6.5V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 5v1.5M7 6.5l.7 12a2 2 0 0 0 2 1.9h4.6a2 2 0 0 0 2-1.9l.7-12"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
      {error && <p className="text-danger text-[11.5px] font-medium text-right max-w-[170px]">{error}</p>}
    </div>
  );
}
