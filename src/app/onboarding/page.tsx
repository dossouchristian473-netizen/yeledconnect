"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ChildDraft = { first_name: string; date_of_birth: string };

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [children, setChildren] = useState<ChildDraft[]>([{ first_name: "", date_of_birth: "" }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  function updateChild(i: number, field: keyof ChildDraft, value: string) {
    setChildren((prev) => prev.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)));
  }

  async function finish() {
    setSaving(true);
    setError(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("profiles")
      .update({ first_name: firstName, last_name: lastName, phone })
      .eq("id", user.id);

    const { data: family, error: famErr } = await supabase
      .from("families")
      .upsert({ parent_id: user.id, family_name: lastName || "Ma famille" }, { onConflict: "parent_id" })
      .select("id")
      .single();

    if (famErr || !family) {
      setError("Impossible de créer l'espace famille. Réessayez.");
      setSaving(false);
      return;
    }

    const validChildren = children.filter((c) => c.first_name.trim());
    if (validChildren.length > 0) {
      await supabase.from("children").insert(
        validChildren.map((c) => ({
          family_id: family.id,
          first_name: c.first_name,
          date_of_birth: c.date_of_birth || null,
        }))
      );
    }

    router.push("/accueil");
    router.refresh();
  }

  return (
    <div className="max-w-[560px] mx-auto min-h-screen px-6 py-6">
      <div className="flex items-center gap-3.5 mb-5">
        <button
          onClick={() => router.push("/accueil")}
          aria-label="Retour"
          className="w-[38px] h-[38px] rounded-full bg-[#e9eef5] flex items-center justify-center flex-shrink-0"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]">
            <path d="M15 5 8 12l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="text-[21px] font-semibold">Créons votre espace famille</span>
      </div>

      <div className="flex gap-1.5 mb-[22px]">
        {[0, 1].map((i) => (
          <span key={i} className={`h-[5px] flex-1 rounded ${i <= step ? "bg-blue-dark" : "bg-border"}`} />
        ))}
      </div>

      <div className="bg-card rounded-lg2 shadow-card p-6">
        {step === 0 ? (
          <>
            <h2 className="text-[20px] font-semibold mb-1.5">Vos coordonnées</h2>
            <p className="text-soft text-[14px] mb-5">
              Pour vous identifier lors des dépôts et récupérations.
            </p>
            <div className="flex gap-3">
              <Field label="Prénom" value={firstName} onChange={setFirstName} placeholder="Sarah" />
              <Field label="Nom" value={lastName} onChange={setLastName} placeholder="Cohen" />
            </div>
            <Field label="Téléphone" value={phone} onChange={setPhone} placeholder="06 12 34 56 78" />
          </>
        ) : (
          <>
            <h2 className="text-[20px] font-semibold mb-1.5">Ajoutez vos enfants</h2>
            <p className="text-soft text-[14px] mb-5">Vous pourrez en ajouter d&apos;autres plus tard.</p>
            {children.map((c, i) => (
              <div key={i} className="border border-border rounded-md2 p-4 mb-3.5 relative">
                {children.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setChildren((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-3 right-3 text-faint text-[12px] font-bold"
                  >
                    Retirer
                  </button>
                )}
                <Field
                  label="Prénom de l'enfant"
                  value={c.first_name}
                  onChange={(v) => updateChild(i, "first_name", v)}
                  placeholder="Léo"
                />
                <Field
                  label="Date de naissance"
                  value={c.date_of_birth}
                  onChange={(v) => updateChild(i, "date_of_birth", v)}
                  placeholder="AAAA-MM-JJ"
                  last
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => setChildren((prev) => [...prev, { first_name: "", date_of_birth: "" }])}
              className="w-full border-[1.5px] border-dashed border-[#c7d3e0] rounded-full py-3.5 text-blue-dark font-bold text-[14px] mb-4"
            >
              + Ajouter un autre enfant
            </button>
          </>
        )}

        {error && <p className="text-danger text-[13px] font-medium mb-3">{error}</p>}

        <div className="flex gap-3 mt-1.5">
          {step > 0 && (
            <button
              onClick={() => setStep(0)}
              className="flex-1 border border-border bg-white rounded-full py-3.5 font-bold text-[14.5px] text-soft"
            >
              Précédent
            </button>
          )}
          <button
            onClick={step === 0 ? () => setStep(1) : finish}
            disabled={saving}
            className="flex-[2] rounded-full py-3.5 font-bold text-[14.5px] text-white bg-gradient-to-br from-[#57b3ef] to-blue-dark shadow-[0_10px_18px_-8px_rgba(44,134,204,0.5)] disabled:opacity-60"
          >
            {step === 0 ? "Continuer" : saving ? "Création..." : "Créer mon espace"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  last,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  last?: boolean;
}) {
  return (
    <div className={last ? "" : "mb-4"} style={{ flex: 1 }}>
      <label className="block text-[11.5px] font-bold tracking-wide text-faint uppercase mb-2">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-border rounded-full px-[18px] py-3.5 text-[15px]"
      />
    </div>
  );
}
