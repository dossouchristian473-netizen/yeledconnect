"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DeleteRowButton } from "@/components/DeleteRowButton";
import { NewsItemContent } from "@/components/home/NewsItemContent";

type NewsItem = {
  id: string;
  title: string;
  content: string;
  image_path: string | null;
  imageUrl: string | null;
};

export function NewsItemCard({ item, canEdit }: { item: NewsItem; canEdit: boolean }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [content, setContent] = useState(item.content);
  const [image, setImage] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  function startEditing() {
    setTitle(item.title);
    setContent(item.content);
    setImage(null);
    setRemoveImage(false);
    setError(null);
    setEditing(true);
  }

  async function handleSave() {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    setError(null);

    let newImagePath: string | null | undefined; // undefined = ne pas toucher à la photo
    if (image) {
      const ext = image.name.split(".").pop() || "jpg";
      newImagePath = `news/${crypto.randomUUID()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("home-photos").upload(newImagePath, image);
      if (uploadErr) {
        setError("La photo n'a pas pu être envoyée. Réessayez.");
        setSaving(false);
        return;
      }
    } else if (removeImage) {
      newImagePath = null;
    }

    const updates: { title: string; content: string; image_path?: string | null } = {
      title: title.trim(),
      content: content.trim(),
    };
    if (newImagePath !== undefined) updates.image_path = newImagePath;

    const { error: updateErr } = await supabase.from("news_posts").update(updates).eq("id", item.id);
    setSaving(false);
    if (updateErr) {
      if (newImagePath) await supabase.storage.from("home-photos").remove([newImagePath]);
      setError("Impossible d'enregistrer. Réessayez.");
      return;
    }

    if (newImagePath !== undefined && item.image_path) {
      await supabase.storage.from("home-photos").remove([item.image_path]);
    }

    setEditing(false);
    router.refresh();
  }

  if (editing) {
    return (
      <div className="bg-card rounded-md2 shadow-card p-[14px] flex flex-col gap-2.5">
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
          {image ? image.name : item.imageUrl && !removeImage ? "Remplacer la photo" : "Ajouter une photo"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              setImage(e.target.files?.[0] ?? null);
              setRemoveImage(false);
            }}
          />
        </label>
        {item.imageUrl && !image && !removeImage && (
          <button
            type="button"
            onClick={() => setRemoveImage(true)}
            className="text-danger text-[12px] font-semibold self-start"
          >
            Retirer la photo actuelle
          </button>
        )}
        {removeImage && <p className="text-soft text-[12px]">La photo sera retirée à l&apos;enregistrement.</p>}
        {error && <p className="text-danger text-[12px] font-medium">{error}</p>}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !title.trim() || !content.trim()}
            className="flex-1 rounded-full bg-blue-dark text-white font-bold text-[12.5px] py-2.5 disabled:opacity-60"
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-full border border-border text-soft font-semibold text-[12.5px] px-4 py-2.5"
          >
            Annuler
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-md2 shadow-card overflow-hidden">
      {item.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.imageUrl} alt="" className="w-full h-[140px] object-cover" />
      )}
      <div className="p-[14px] flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-bold text-[13.5px]">{item.title}</div>
          <NewsItemContent content={item.content} />
        </div>
        {canEdit && (
          <div className="flex flex-col gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={startEditing}
              aria-label="Modifier"
              className="w-9 h-9 rounded-full bg-blue-bg text-blue-dark flex items-center justify-center"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-[15px] h-[15px]">
                <path
                  d="M14.5 5.5 18.5 9.5M4 20l.9-3.9a2 2 0 0 1 .53-.98L15.5 5.06a1.5 1.5 0 0 1 2.12 0l1.32 1.32a1.5 1.5 0 0 1 0 2.12L8.88 18.57a2 2 0 0 1-.98.53L4 20Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <DeleteRowButton table="news_posts" id={item.id} />
          </div>
        )}
      </div>
    </div>
  );
}
