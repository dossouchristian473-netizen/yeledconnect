"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function NewsAddForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
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

    const { error: insertErr } = await supabase.from("news_posts").insert({
      title: title.trim(),
      content: content.trim(),
      created_by: user?.id ?? null,
    });

    setSaving(false);
    if (insertErr) {
      setError("Impossible de publier la nouvelle. Réessayez.");
      return;
    }

    setTitle("");
    setContent("");
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
