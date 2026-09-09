"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ChildAvatar } from "@/components/ChildAvatar";

type Room = { id: string; name: string };

type ChildData = {
  id: string;
  first_name: string;
  last_name: string | null;
  date_of_birth: string | null;
  allergies: string | null;
  special_needs: string | null;
  current_room_id: string | null;
  prayer_subject: string | null;
  home_address: string | null;
  second_parent_name: string | null;
  second_parent_phone: string | null;
  second_parent_email: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relationship: string | null;
  custody_notes: string | null;
};

export function ChildEditForm({
  child,
  photoUrl,
  backHref,
  rooms,
}: {
  child: ChildData;
  photoUrl: string | null;
  backHref: string;
  rooms?: Room[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [fields, setFields] = useState({
    first_name: child.first_name,
    last_name: child.last_name ?? "",
    date_of_birth: child.date_of_birth ?? "",
    allergies: child.allergies ?? "",
    special_needs: child.special_needs ?? "",
    current_room_id: child.current_room_id ?? "",
    prayer_subject: child.prayer_subject ?? "",
    home_address: child.home_address ?? "",
    second_parent_name: child.second_parent_name ?? "",
    second_parent_phone: child.second_parent_phone ?? "",
    second_parent_email: child.second_parent_email ?? "",
    emergency_contact_name: child.emergency_contact_name ?? "",
    emergency_contact_phone: child.emergency_contact_phone ?? "",
    emergency_contact_relationship: child.emergency_contact_relationship ?? "",
    custody_notes: child.custody_notes ?? "",
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(photoUrl);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof typeof fields>(key: K, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function pickPhoto(file: File | null) {
    setPhotoFile(file);
    if (file) setPhotoPreview(URL.createObjectURL(file));
  }

  async function save() {
    if (!fields.first_name.trim()) {
      setError("Le prénom est obligatoire.");
      return;
    }
    setSaving(true);
    setError(null);

    if (photoFile) {
      const ext = photoFile.name.split(".").pop() || "jpg";
      const path = `${child.id}/photo.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("child-photos")
        .upload(path, photoFile, { upsert: true });
      if (uploadErr) {
        setError("Impossible d'envoyer la photo. Réessayez.");
        setSaving(false);
        return;
      }
      await supabase.from("children").update({ photo_url: path }).eq("id", child.id);
    }

    const { error: updateErr } = await supabase
      .from("children")
      .update({
        first_name: fields.first_name.trim(),
        last_name: fields.last_name.trim() || null,
        date_of_birth: fields.date_of_birth || null,
        allergies: fields.allergies.trim() || null,
        special_needs: fields.special_needs.trim() || null,
        ...(rooms ? { current_room_id: fields.current_room_id || null } : {}),
        prayer_subject: fields.prayer_subject.trim() || null,
        home_address: fields.home_address.trim() || null,
        second_parent_name: fields.second_parent_name.trim() || null,
        second_parent_phone: fields.second_parent_phone.trim() || null,
        second_parent_email: fields.second_parent_email.trim() || null,
        emergency_contact_name: fields.emergency_contact_name.trim() || null,
        emergency_contact_phone: fields.emergency_contact_phone.trim() || null,
        emergency_contact_relationship: fields.emergency_contact_relationship.trim() || null,
        custody_notes: fields.custody_notes.trim() || null,
      })
      .eq("id", child.id);

    setSaving(false);
    if (updateErr) {
      setError("Impossible d'enregistrer la fiche. Réessayez.");
      return;
    }

    router.push(backHref);
    router.refresh();
  }

  return (
    <div className="px-6 flex flex-col gap-4 pb-8">
      <div className="bg-card rounded-lg2 shadow-card p-[22px] flex items-center gap-4">
        <ChildAvatar photoUrl={photoPreview} firstName={fields.first_name || "?"} size={56} />
        <label className="flex-1 border border-border rounded-full px-[18px] py-3 text-[13.5px] text-soft text-center cursor-pointer">
          {photoFile ? photoFile.name : "Changer la photo"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => pickPhoto(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      <Section title="Identité">
        <Row>
          <Field label="Prénom" value={fields.first_name} onChange={(v) => set("first_name", v)} />
          <Field label="Nom" value={fields.last_name} onChange={(v) => set("last_name", v)} />
        </Row>
        <Field
          label="Date de naissance"
          value={fields.date_of_birth}
          onChange={(v) => set("date_of_birth", v)}
          placeholder="AAAA-MM-JJ"
        />
        {rooms && (
          <div className="mb-4">
            <label className="block text-[11.5px] font-bold tracking-wide text-faint uppercase mb-2">Salle</label>
            <select
              value={fields.current_room_id}
              onChange={(e) => set("current_room_id", e.target.value)}
              className="w-full border border-border rounded-full px-[18px] py-3.5 text-[15px] bg-white"
            >
              <option value="">Aucune salle</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </Section>

      <Section title="Santé et besoins">
        <TextArea label="Allergies" value={fields.allergies} onChange={(v) => set("allergies", v)} />
        <TextArea
          label="Besoins particuliers"
          value={fields.special_needs}
          onChange={(v) => set("special_needs", v)}
          last
        />
      </Section>

      <Section title="Sujet de prière">
        <TextArea label="Sujet de prière (facultatif)" value={fields.prayer_subject} onChange={(v) => set("prayer_subject", v)} last />
      </Section>

      <Section title="Coordonnées familiales">
        <Field label="Adresse" value={fields.home_address} onChange={(v) => set("home_address", v)} />
        <Field
          label="Deuxième parent — nom"
          value={fields.second_parent_name}
          onChange={(v) => set("second_parent_name", v)}
        />
        <Row>
          <Field
            label="Téléphone"
            value={fields.second_parent_phone}
            onChange={(v) => set("second_parent_phone", v)}
          />
          <Field label="Email" value={fields.second_parent_email} onChange={(v) => set("second_parent_email", v)} />
        </Row>
      </Section>

      <Section title="Contact d'urgence">
        <Field
          label="Nom"
          value={fields.emergency_contact_name}
          onChange={(v) => set("emergency_contact_name", v)}
        />
        <Row>
          <Field
            label="Téléphone"
            value={fields.emergency_contact_phone}
            onChange={(v) => set("emergency_contact_phone", v)}
          />
          <Field
            label="Lien"
            value={fields.emergency_contact_relationship}
            onChange={(v) => set("emergency_contact_relationship", v)}
            placeholder="Tante, voisin..."
          />
        </Row>
      </Section>

      <Section title="Parents séparés">
        <TextArea
          label="Garde, jours de récupération, précisions utiles..."
          value={fields.custody_notes}
          onChange={(v) => set("custody_notes", v)}
          last
        />
      </Section>

      {error && <p className="text-danger text-[13px] font-medium">{error}</p>}

      <button
        onClick={save}
        disabled={saving}
        className="rounded-full py-3.5 font-bold text-[14.5px] text-white bg-gradient-to-br from-[#57b3ef] to-blue-dark shadow-[0_10px_18px_-8px_rgba(44,134,204,0.5)] disabled:opacity-60"
      >
        {saving ? "Enregistrement..." : "Enregistrer"}
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-lg2 shadow-card p-[22px]">
      <h3 className="text-[15px] font-semibold mb-3.5">{title}</h3>
      {children}
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex gap-3">{children}</div>;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="mb-4 flex-1">
      <label className="block text-[11.5px] font-bold tracking-wide text-faint uppercase mb-2">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-border rounded-full px-[18px] py-3.5 text-[15px]"
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  last,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  last?: boolean;
}) {
  return (
    <div className={last ? "" : "mb-4"}>
      <label className="block text-[11.5px] font-bold tracking-wide text-faint uppercase mb-2">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full border border-border rounded-md2 px-4 py-3.5 text-[14.5px] resize-none"
      />
    </div>
  );
}
