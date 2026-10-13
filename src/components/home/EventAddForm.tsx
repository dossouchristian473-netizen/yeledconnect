"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Room = { id: string; name: string };

export function EventAddForm({ rooms }: { rooms: Room[] }) {
  const [title, setTitle] = useState("");
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

    const { error: insertErr } = await supabase.from("events").insert({
      title: title.trim(),
      event_date: eventDate,
      room_id: roomId || null,
      created_by: user?.id ?? null,
    });

    setSaving(false);
    if (insertErr) {
      setError("Impossible de créer l'événement. Réessayez.");
      return;
    }

    setTitle("");
    setEventDate("");
    setRoomId("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-md2 shadow-card p-4 flex flex-col gap-2.5">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titre de l'événement"
        className="w-full border border-border rounded-full px-4 py-2.5 text-[13.5px]"
      />
      <input
        type="date"
        value={eventDate}
        onChange={(e) => setEventDate(e.target.value)}
        className="w-full border border-border rounded-full px-4 py-2.5 text-[13.5px]"
      />
      <select
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        className="w-full border border-border rounded-full px-4 py-2.5 text-[13.5px] bg-white"
      >
        <option value="">Toutes les classes</option>
        {rooms.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </select>
      {error && <p className="text-danger text-[12px] font-medium">{error}</p>}
      <button
        type="submit"
        disabled={saving || !title.trim() || !eventDate}
        className="rounded-full bg-blue-dark text-white font-bold text-[12.5px] py-2.5 disabled:opacity-60"
      >
        {saving ? "Ajout..." : "Ajouter"}
      </button>
    </form>
  );
}
