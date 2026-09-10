"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ResourceAddForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [resourceType, setResourceType] = useState<"lien" | "video">("lien");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    setSaving(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error: insertErr } = await supabase.from("spiritual_resources").insert({
      title: title.trim(),
      description: description.trim() || null,
      url: url.trim(),
      resource_type: resourceType,
      created_by: user?.id ?? null,
    });

    setSaving(false);
    if (insertErr) {
      setError("Impossible d'ajouter la ressource. Réessayez.");
      return;
    }

    setTitle("");
    setDescription("");
    setUrl("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-md2 shadow-card p-4 flex flex-col gap-2.5">
      <div className="flex gap-2">
        {(["lien", "video"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setResourceType(t)}
            className={`flex-1 py-2 rounded-full border text-[12px] font-semibold ${
              resourceType === t ? "border-blue-dark bg-blue-bg text-blue-dark" : "border-border text-faint"
            }`}
          >
            {t === "lien" ? "Lien" : "Vidéo YouTube"}
          </button>
        ))}
      </div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titre"
        className="w-full border border-border rounded-full px-4 py-2.5 text-[13.5px]"
      />
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder={resourceType === "video" ? "https://youtube.com/watch?v=..." : "https://..."}
        className="w-full border border-border rounded-full px-4 py-2.5 text-[13.5px]"
      />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optionnel)"
        className="w-full border border-border rounded-full px-4 py-2.5 text-[13.5px]"
      />
      {error && <p className="text-danger text-[12px] font-medium">{error}</p>}
      <button
        type="submit"
        disabled={saving || !title.trim() || !url.trim()}
        className="rounded-full bg-blue-dark text-white font-bold text-[12.5px] py-2.5 disabled:opacity-60"
      >
        {saving ? "Ajout..." : "Ajouter"}
      </button>
    </form>
  );
}
