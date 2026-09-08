"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function NoteForm({ childId }: { childId: string }) {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }

    await supabase.from("moniteur_notes").insert({
      child_id: childId,
      moniteur_id: user.id,
      note: note.trim(),
    });

    setNote("");
    setSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Écrivez une note privée sur cet enfant..."
        rows={3}
        className="w-full border border-border rounded-md2 px-4 py-3.5 text-[14.5px] resize-none"
      />
      <button
        type="submit"
        disabled={saving || !note.trim()}
        className="self-end rounded-full py-2.5 px-5 font-bold text-[13.5px] text-white bg-gradient-to-br from-[#4fd0be] to-teal-dark shadow-[0_10px_18px_-8px_rgba(31,156,134,0.5)] disabled:opacity-60"
      >
        {saving ? "..." : "Ajouter la note"}
      </button>
    </form>
  );
}
