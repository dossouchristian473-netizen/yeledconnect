"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Moniteur = { id: string; username: string };
type Room = { id: string; name: string };

export function PlanningAddForm({ moniteurs, rooms }: { moniteurs: Moniteur[]; rooms: Room[] }) {
  const [moniteurId, setMoniteurId] = useState(moniteurs[0]?.id ?? "");
  const [serviceDate, setServiceDate] = useState("");
  const [roomId, setRoomId] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!moniteurId || !serviceDate) return;
    setSaving(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error: insertErr } = await supabase.from("moniteur_schedule").insert({
      moniteur_id: moniteurId,
      service_date: serviceDate,
      room_id: roomId || null,
      notes: notes.trim() || null,
      created_by: user?.id ?? null,
    });

    setSaving(false);
    if (insertErr) {
      setError(
        insertErr.code === "23505"
          ? "Ce moniteur est déjà planifié à cette date."
          : "Impossible d'ajouter cette date. Réessayez."
      );
      return;
    }

    setServiceDate("");
    setNotes("");
    router.refresh();
  }

  if (moniteurs.length === 0) {
    return <p className="text-soft text-[14px]">Aucun moniteur trouvé.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-lg2 shadow-card p-6 flex flex-col gap-3.5">
      <h3 className="text-[15px] font-semibold">Ajouter une date d&apos;astreinte</h3>
      <div>
        <label className="block text-[11.5px] font-bold tracking-wide text-faint uppercase mb-2">Moniteur</label>
        <select
          value={moniteurId}
          onChange={(e) => setMoniteurId(e.target.value)}
          className="w-full border border-border rounded-full px-[18px] py-3.5 text-[15px] bg-white"
        >
          {moniteurs.map((m) => (
            <option key={m.id} value={m.id}>
              {m.username}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-[11.5px] font-bold tracking-wide text-faint uppercase mb-2">Date</label>
        <input
          type="date"
          value={serviceDate}
          onChange={(e) => setServiceDate(e.target.value)}
          className="w-full border border-border rounded-full px-[18px] py-3.5 text-[15px]"
        />
      </div>
      <div>
        <label className="block text-[11.5px] font-bold tracking-wide text-faint uppercase mb-2">
          Salle (optionnel)
        </label>
        <select
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="w-full border border-border rounded-full px-[18px] py-3.5 text-[15px] bg-white"
        >
          <option value="">Non précisé</option>
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-[11.5px] font-bold tracking-wide text-faint uppercase mb-2">
          Notes (optionnel)
        </label>
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Remplacement, formation..."
          className="w-full border border-border rounded-full px-[18px] py-3.5 text-[15px]"
        />
      </div>

      {error && <p className="text-danger text-[13px] font-medium">{error}</p>}

      <button
        type="submit"
        disabled={saving || !moniteurId || !serviceDate}
        className="rounded-full py-3.5 font-bold text-[14.5px] text-white bg-gradient-to-br from-[#57b3ef] to-blue-dark shadow-[0_10px_18px_-8px_rgba(44,134,204,0.5)] disabled:opacity-60"
      >
        {saving ? "Ajout..." : "Ajouter"}
      </button>
    </form>
  );
}
