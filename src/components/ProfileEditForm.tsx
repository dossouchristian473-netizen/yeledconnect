"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ProfileEditForm({
  userId,
  initialFirstName,
  initialLastName,
  initialPhone,
  initialEmail,
  showPhone = true,
}: {
  userId: string;
  initialFirstName: string | null;
  initialLastName: string | null;
  initialPhone: string | null;
  initialEmail: string;
  showPhone?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(initialFirstName ?? "");
  const [lastName, setLastName] = useState(initialLastName ?? "");
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [email, setEmail] = useState(initialEmail);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailPending, setEmailPending] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  function startEditing() {
    setFirstName(initialFirstName ?? "");
    setLastName(initialLastName ?? "");
    setPhone(initialPhone ?? "");
    setEmail(initialEmail);
    setError(null);
    setEditing(true);
  }

  async function save() {
    setSaving(true);
    setError(null);

    const updates: { first_name: string | null; last_name: string | null; phone?: string | null } = {
      first_name: firstName.trim() || null,
      last_name: lastName.trim() || null,
    };
    if (showPhone) updates.phone = phone.trim() || null;

    const { error: profileErr } = await supabase.from("profiles").update(updates).eq("id", userId);
    if (profileErr) {
      setError("Impossible d'enregistrer vos informations. Réessayez.");
      setSaving(false);
      return;
    }

    if (email.trim() && email.trim() !== initialEmail) {
      const { error: emailErr } = await supabase.auth.updateUser({ email: email.trim() });
      if (emailErr) {
        setError(`Vos informations sont enregistrées, mais l'email n'a pas pu être mis à jour : ${emailErr.message}`);
        setSaving(false);
        return;
      }
      setEmailPending(true);
    }

    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    const fullName = [initialFirstName, initialLastName].filter(Boolean).join(" ");
    return (
      <div className="mt-[18px] bg-card rounded-lg2 shadow-card p-[22px]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[15px] font-semibold">Mes informations</h3>
          <button type="button" onClick={startEditing} className="text-blue-dark font-bold text-[12.5px]">
            Modifier
          </button>
        </div>
        <div className="flex flex-col gap-1 text-[14px]">
          <p className={fullName ? "text-ink" : "text-faint"}>{fullName || "Nom non renseigné"}</p>
          {showPhone && (
            <p className={initialPhone ? "text-soft" : "text-faint"}>{initialPhone || "Téléphone non renseigné"}</p>
          )}
          <p className="text-soft">{initialEmail}</p>
        </div>
        {emailPending && (
          <p className="text-teal-dark text-[12.5px] mt-2.5">
            Un email de confirmation a été envoyé à la nouvelle adresse pour valider le changement.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-[18px] bg-card rounded-lg2 shadow-card p-[22px] flex flex-col gap-3">
      <h3 className="text-[15px] font-semibold">Modifier mes informations</h3>
      <div className="flex gap-2.5">
        <input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Prénom"
          className="flex-1 min-w-0 border border-border rounded-full px-[16px] py-3 text-[14.5px]"
        />
        <input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Nom"
          className="flex-1 min-w-0 border border-border rounded-full px-[16px] py-3 text-[14.5px]"
        />
      </div>
      {showPhone && (
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Téléphone"
          className="w-full border border-border rounded-full px-[18px] py-3 text-[14.5px]"
        />
      )}
      <div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full border border-border rounded-full px-[18px] py-3 text-[14.5px]"
        />
        <p className="text-faint text-[11.5px] mt-1.5">
          Un changement d&apos;email doit être confirmé via le lien envoyé à la nouvelle adresse.
        </p>
      </div>

      {error && <p className="text-danger text-[13px] font-medium">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="flex-1 rounded-full bg-blue-dark text-white font-bold text-[13.5px] py-3 disabled:opacity-60"
        >
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-full border border-border text-soft font-semibold text-[13.5px] px-4 py-3"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
