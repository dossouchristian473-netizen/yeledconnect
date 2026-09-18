"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function NewsAddForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    let imagePath: string | null = null;
    if (image) {
      const ext = image.name.split(".").pop() || "jpg";
      imagePath = `news/${crypto.randomUUID()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("home-photos").upload(imagePath, image);
      if (uploadErr) {
        setError("La photo n'a pas pu être envoyée. Réessayez.");
        setSaving(false);
        return;
      }
    }

    const { error: insertErr } = await supabase.from("news_posts").insert({
      title: title.trim(),
      content: content.trim(),
      image_path: imagePath,
      created_by: user?.id ?? null,
    });

    setSaving(false);
    if (insertErr) {
      if (imagePath) await supabase.storage.from("home-photos").remove([imagePath]);
      setError("Impossible de publier la nouvelle. Réessayez.");
      return;
    }

    setTitle("");
    setContent("");
    setImage(null);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-md2 shadow-card p-4 flex flex-col gap-2.5">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titre"
        className="w-full border border-border rounded-full px-4 py-2.5 text-[13.5px]"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Contenu"
        rows={3}
        className="w-full border border-border rounded-md2 px-4 py-2.5 text-[13.5px] resize-none"
      />
      <label className="border border-border rounded-full px-4 py-2.5 text-[13px] text-soft text-center cursor-pointer">
        {image ? image.name : "Ajouter une photo (optionnel)"}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => setImage(e.target.files?.[0] ?? null)}
        />
      </label>
      {error && <p className="text-danger text-[12px] font-medium">{error}</p>}
      <button
        type="submit"
        disabled={saving || !title.trim() || !content.trim()}
        className="rounded-full bg-blue-dark text-white font-bold text-[12.5px] py-2.5 disabled:opacity-60"
      >
        {saving ? "Publication..." : "Publier"}
      </button>
    </form>
  );
}
