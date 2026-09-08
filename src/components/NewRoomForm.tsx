"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function NewRoomForm({ redirectHref }: { redirectHref: string }) {
  const [name, setName] = useState("");
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");
  const [capacity, setCapacity] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);

    const { error } = await supabase.from("rooms").insert({
      name: name.trim(),
      age_min: ageMin ? Number(ageMin) : null,
      age_max: ageMax ? Number(ageMax) : null,
      capacity: capacity ? Number(capacity) : null,
    });

    if (error) {
      setError("Impossible de créer la salle. Réessayez.");
      setSaving(false);
      return;
    }

    router.push(redirectHref);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="px-6">
      <div className="bg-card rounded-lg2 shadow-card p-6 flex flex-col gap-4">
        <Field label="Nom de la salle" value={name} onChange={setName} placeholder="Étoiles Filantes" />
        <div className="flex gap-3">
          <Field label="Âge min" value={ageMin} onChange={setAgeMin} placeholder="3" type="number" />
          <Field label="Âge max" value={ageMax} onChange={setAgeMax} placeholder="5" type="number" />
        </div>
        <Field label="Capacité" value={capacity} onChange={setCapacity} placeholder="15" type="number" />

        {error && <p className="text-danger text-[13px] font-medium">{error}</p>}

        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="rounded-full py-3.5 font-bold text-[14.5px] text-white bg-gradient-to-br from-[#57b3ef] to-blue-dark shadow-[0_10px_18px_-8px_rgba(44,134,204,0.5)] disabled:opacity-60"
        >
          {saving ? "Création..." : "Créer la salle"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div style={{ flex: 1 }}>
      <label className="block text-[11.5px] font-bold tracking-wide text-faint uppercase mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-border rounded-full px-[18px] py-3.5 text-[15px]"
      />
    </div>
  );
}
