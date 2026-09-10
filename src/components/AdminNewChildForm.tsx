"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AdminNewChildForm({ parents }: { parents: { id: string; username: string }[] }) {
  const router = useRouter();
  const supabase = createClient();

  const [parentId, setParentId] = useState(parents[0]?.id ?? "");
  const [firstName, setFirstName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function pickPhoto(file: File | null) {
    setPhotoFile(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  }

  async function save() {
    setError(null);

    if (!parentId) {
      setError("Sélectionnez le parent de cet enfant.");
      return;
    }
    if (!firstName.trim()) {
      setError("Le prénom est obligatoire.");
      return;
    }
    if (!photoFile) {
      setError("Une photo de l'enfant est obligatoire.");
      return;
    }

    setSaving(true);

    const { data: existingFamily } = await supabase
      .from("families")
      .select("id")
      .eq("parent_id", parentId)
      .maybeSingle();

    let familyId = existingFamily?.id as string | undefined;

    if (!familyId) {
      const parentUsername = parents.find((p) => p.id === parentId)?.username ?? "";
      const { data: newFamily, error: famErr } = await supabase
        .from("families")
        .insert({ parent_id: parentId, family_name: `Famille ${parentUsername}` })
        .select("id")
        .single();
      if (famErr || !newFamily) {
        setError("Impossible de créer l'espace famille de ce parent. Réessayez.");
        setSaving(false);
        return;
      }
      familyId = newFamily.id;
    }

    // La photo est obligatoire en base (photo_url not null) : on génère
    // l'id et le chemin de stockage avant l'insertion pour fournir photo_url
    // dès la création (voir la même logique dans onboarding/page.tsx).
    const childId = crypto.randomUUID();
    const ext = photoFile.name.split(".").pop() || "jpg";
    const path = `${childId}/photo.${ext}`;

    const { error: childErr } = await supabase
      .from("children")
      .insert({ id: childId, family_id: familyId, first_name: firstName.trim(), date_of_birth: dateOfBirth || null, photo_url: path });

    if (childErr) {
      setError("Impossible de créer la fiche enfant. Réessayez.");
      setSaving(false);
      return;
    }

    const { error: uploadErr } = await supabase.storage.from("child-photos").upload(path, photoFile, { upsert: true });

    if (uploadErr) {
      // Pas d'enfant sans photo : on annule la création plutôt que de laisser
      // une fiche incomplète.
      await supabase.from("children").delete().eq("id", childId);
      setError("La photo n'a pas pu être envoyée. Réessayez.");
      setSaving(false);
      return;
    }

    router.push(`/admin/enfants/${childId}`);
    router.refresh();
  }

  return (
    <div className="px-6 flex flex-col gap-4 pb-8">
      <div className="bg-card rounded-lg2 shadow-card p-[22px] flex flex-col gap-3.5">
        <div>
          <label className="block text-[11.5px] font-bold tracking-wide text-faint uppercase mb-2">Parent</label>
          {parents.length === 0 ? (
            <p className="text-soft text-[14px]">
              Aucun compte parent trouvé. Un parent doit d&apos;abord créer son compte via l&apos;écran de connexion.
            </p>
          ) : (
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full border border-border rounded-full px-[18px] py-3.5 text-[15px] bg-white"
            >
              {parents.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.username}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-[11.5px] font-bold tracking-wide text-faint uppercase mb-2">
            Prénom de l&apos;enfant
          </label>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Léo"
            className="w-full border border-border rounded-full px-[18px] py-3.5 text-[15px]"
          />
        </div>

        <div>
          <label className="block text-[11.5px] font-bold tracking-wide text-faint uppercase mb-2">
            Date de naissance
          </label>
          <input
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            placeholder="AAAA-MM-JJ"
            className="w-full border border-border rounded-full px-[18px] py-3.5 text-[15px]"
          />
        </div>

        <div>
          <label className="block text-[11.5px] font-bold tracking-wide text-faint uppercase mb-2">
            Photo de l&apos;enfant *
          </label>
          <div className="flex items-center gap-3">
            {photoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoPreview} alt="" className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-blue-bg flex-shrink-0" aria-hidden />
            )}
            <label className="flex-1 border border-border rounded-full px-[18px] py-3 text-[13.5px] text-soft text-center cursor-pointer">
              {photoFile ? photoFile.name : "Choisir une photo"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => pickPhoto(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>
        </div>
      </div>

      {error && <p className="text-danger text-[13px] font-medium">{error}</p>}

      <button
        onClick={save}
        disabled={saving || parents.length === 0}
        className="rounded-full py-3.5 font-bold text-[14.5px] text-white bg-gradient-to-br from-[#57b3ef] to-blue-dark shadow-[0_10px_18px_-8px_rgba(44,134,204,0.5)] disabled:opacity-60"
      >
        {saving ? "Création..." : "Créer la fiche enfant"}
      </button>
    </div>
  );
}
