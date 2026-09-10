"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Room = { id: string; name: string };

export function NewAnnouncementForm({ rooms }: { rooms: Room[] }) {
  const [roomId, setRoomId] = useState(rooms[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const isValid = roomId && title.trim() && content.trim();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setSaving(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error: insertErr } = await supabase.from("class_announcements").insert({
      room_id: roomId,
      title: title.trim(),
      content: content.trim(),
      created_by: user?.id ?? null,
    });

    setSaving(false);
    if (insertErr) {
      setError("Impossible de publier l'annonce. Réessayez.");
      return;
    }

    setTitle("");
    setContent("");
    router.refresh();
  }

  if (rooms.length === 0) {
    return <p className="text-soft text-[14px]">Aucune salle disponible pour publier une annonce.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-lg2 shadow-card p-6 flex flex-col gap-3.5">
      <h3 className="text-[15px] font-semibold">Nouvelle annonce</h3>
      <div>
        <label className="block text-[11.5px] font-bold tracking-wide text-faint uppercase mb-2">Classe</label>
        <select
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="w-full border border-border rounded-full px-[18px] py-3.5 text-[15px] bg-white"
        >
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-[11.5px] font-bold tracking-wide text-faint uppercase mb-2">Titre</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Vêtement bleu ce dimanche"
          className="w-full border border-border rounded-full px-[18px] py-3.5 text-[15px]"
        />
      </div>
      <div>
        <label className="block text-[11.5px] font-bold tracking-wide text-faint uppercase mb-2">Message</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          placeholder="Les enfants doivent porter un vêtement bleu pour l'activité de dimanche."
          className="w-full border border-border rounded-md2 px-4 py-3.5 text-[14.5px] resize-none"
        />
      </div>

      {error && <p className="text-danger text-[13px] font-medium">{error}</p>}

      <button
        type="submit"
        disabled={saving || !isValid}
        className="rounded-full py-3.5 font-bold text-[14.5px] text-white bg-gradient-to-br from-[#57b3ef] to-blue-dark shadow-[0_10px_18px_-8px_rgba(44,134,204,0.5)] disabled:opacity-60"
      >
        {saving ? "Publication..." : "Publier l'annonce"}
      </button>
    </form>
  );
}
