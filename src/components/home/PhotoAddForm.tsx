"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function PhotoAddForm() {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setSaving(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;

    const { error: uploadErr } = await supabase.storage.from("home-photos").upload(path, file);
    if (uploadErr) {
      setError("La photo n'a pas pu être envoyée. Réessayez.");
      setSaving(false);
      return;
    }

    const { error: insertErr } = await supabase.from("home_photos").insert({
      photo_path: path,
      caption: caption.trim() || null,
      created_by: user?.id ?? null,
    });

    setSaving(false);
    if (insertErr) {
      await supabase.storage.from("home-photos").remove([path]);
      setError("Impossible d'enregistrer la photo. Réessayez.");
      return;
    }

    setFile(null);
    setCaption("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-md2 shadow-card p-4 flex flex-col gap-2.5">
      <label className="border border-border rounded-full px-4 py-2.5 text-[13px] text-soft text-center cursor-pointer">
        {file ? file.name : "Choisir une photo"}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </label>
      <input
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Légende (optionnel)"
        className="w-full border border-border rounded-full px-4 py-2.5 text-[13.5px]"
      />
      {error && <p className="text-danger text-[12px] font-medium">{error}</p>}
      <button
        type="submit"
        disabled={saving || !file}
        className="rounded-full bg-blue-dark text-white font-bold text-[12.5px] py-2.5 disabled:opacity-60"
      >
        {saving ? "Envoi..." : "Ajouter"}
      </button>
    </form>
  );
}
