"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Room = { id: string; name: string };

export function NewEventForm({ rooms }: { rooms: Room[] }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [roomId, setRoomId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !eventDate) return;
    setSaving(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("events").insert({
      title: title.trim(),
      description: description.trim() || null,
      event_date: eventDate,
      room_id: roomId || null,
      created_by: user?.id ?? null,
    });

    if (error) {
      setError("Impossible de créer l'événement. Réessayez.");
      setSaving(false);
      return;
    }

    router.push("/responsable/agenda");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="px-6">
      <div className="bg-card rounded-lg2 shadow-card p-6 flex flex-col gap-4">
        <div>
          <label className="block text-[11.5px] font-bold tracking-wide text-faint uppercase mb-2">Titre</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sortie au parc"
            className="w-full border border-border rounded-full px-[18px] py-3.5 text-[15px]"
          />
        </div>
        <div>
          <label className="block text-[11.5px] font-bold tracking-wide text-faint uppercase mb-2">Date</label>
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="w-full border border-border rounded-full px-[18px] py-3.5 text-[15px]"
          />
        </div>
        <div>
          <label className="block text-[11.5px] font-bold tracking-wide text-faint uppercase mb-2">Salle concernée</label>
          <select
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full border border-border rounded-full px-[18px] py-3.5 text-[15px] bg-white"
          >
            <option value="">Toutes les salles</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11.5px] font-bold tracking-wide text-faint uppercase mb-2">
            Description (optionnel)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full border border-border rounded-md2 px-4 py-3.5 text-[14.5px] resize-none"
          />
        </div>

        {error && <p className="text-danger text-[13px] font-medium">{error}</p>}

        <button
          type="submit"
          disabled={saving || !title.trim() || !eventDate}
          className="rounded-full py-3.5 font-bold text-[14.5px] text-white bg-gradient-to-br from-[#57b3ef] to-blue-dark shadow-[0_10px_18px_-8px_rgba(44,134,204,0.5)] disabled:opacity-60"
        >
          {saving ? "Création..." : "Créer l'événement"}
        </button>
      </div>
    </form>
  );
}
