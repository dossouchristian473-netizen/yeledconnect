"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function DeleteChildButton({
  childId,
  firstName,
  photoPath,
  redirectTo,
}: {
  childId: string;
  firstName: string;
  photoPath: string | null;
  redirectTo: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleDelete() {
    setDeleting(true);
    setError(null);

    const { error: deleteErr } = await supabase.from("children").delete().eq("id", childId);
    if (deleteErr) {
      setError("Impossible de supprimer cet enfant. Réessayez.");
      setDeleting(false);
      return;
    }

    if (photoPath) await supabase.storage.from("child-photos").remove([photoPath]);

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="px-6 pb-10">
      <div className="bg-card rounded-lg2 shadow-card p-[22px]">
        <h3 className="text-[15px] font-semibold mb-1.5">Supprimer cet enfant</h3>
        <p className="text-soft text-[13px] mb-3.5">
          La fiche de {firstName} et tout son historique (présences, comptes rendus, résultats) seront
          définitivement supprimés.
        </p>
        {error && <p className="text-danger text-[12.5px] font-medium mb-2.5">{error}</p>}
        {confirming ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 rounded-full bg-danger text-white font-bold text-[13px] py-3 disabled:opacity-60"
            >
              {deleting ? "Suppression..." : "Oui, supprimer définitivement"}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={deleting}
              className="rounded-full border border-border text-soft font-semibold text-[13px] px-4 py-3"
            >
              Annuler
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="w-full rounded-full bg-[#fbeaea] text-danger font-bold text-[13px] py-3"
          >
            Supprimer {firstName}
          </button>
        )}
      </div>
    </div>
  );
}
