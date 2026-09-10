"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ROOM_CLASSES, formatAgeRange } from "@/lib/rooms";
import { RoomIcon } from "@/components/RoomIcon";

export function NewRoomForm({ redirectHref }: { redirectHref: string }) {
  const [selected, setSelected] = useState<(typeof ROOM_CLASSES)[number] | null>(null);
  const [capacity, setCapacity] = useState("20");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    setError(null);

    const { error } = await supabase.from("rooms").insert({
      name: selected.name,
      age_min: selected.ageMin,
      age_max: selected.ageMax,
      color: selected.color,
      icon: selected.icon,
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
        <div>
          <label className="block text-[11.5px] font-bold tracking-wide text-faint uppercase mb-2">Classe</label>
          <div className="grid grid-cols-2 gap-2.5">
            {ROOM_CLASSES.map((c) => {
              const active = selected?.name === c.name;
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setSelected(c)}
                  className={`rounded-md2 p-3.5 text-left border-2 ${
                    active ? "border-blue-dark" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c.color }}
                >
                  <RoomIcon icon={c.icon} className="w-5 h-5 mb-1.5" />
                  <div className="font-bold text-[14.5px]">{c.name}</div>
                  <div className="text-[12px] text-ink/70">{formatAgeRange(c.ageMin, c.ageMax)}</div>
                </button>
              );
            })}
          </div>
        </div>

        <Field label="Capacité" value={capacity} onChange={setCapacity} placeholder="20" type="number" />

        {error && <p className="text-danger text-[13px] font-medium">{error}</p>}

        <button
          type="submit"
          disabled={saving || !selected}
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
