"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreateAdoAccountForm({
  childId,
  adoUsername,
}: {
  childId: string;
  adoUsername: string | null;
}) {
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);
  const [identifiant, setIdentifiant] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdIdentifiant, setCreatedIdentifiant] = useState<string | null>(null);

  async function handleCreate() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/ado/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ childId, identifiant, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Une erreur est survenue.");
      return;
    }
    setCreatedIdentifiant(data.identifiant);
    router.refresh();
  }

  function startEdit() {
    setIdentifiant(adoUsername ?? "");
    setPassword("");
    setError(null);
    setShowEdit(true);
  }

  async function handleUpdate() {
    setLoading(true);
    setError(null);
    const identifiantChanged = identifiant.trim() && identifiant.trim() !== adoUsername;
    const res = await fetch("/api/ado/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        childId,
        identifiant: identifiantChanged ? identifiant : undefined,
        password: password || undefined,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Une erreur est survenue.");
      return;
    }
    setPassword("");
    setShowEdit(false);
    router.refresh();
  }

  if (createdIdentifiant) {
    return (
      <div className="bg-card rounded-lg2 shadow-card p-[18px]">
        <h3 className="text-[15px] font-semibold mb-2">Compte ado créé 🎉</h3>
        <p className="text-[14px] text-ink">
          Identifiant : <span className="font-bold">{createdIdentifiant}</span>
        </p>
        <p className="text-soft text-[13px] mt-1.5">
          Communiquez cet identifiant et le mot de passe choisi à l&apos;ado — il pourra se connecter depuis
          l&apos;écran de connexion, onglet &quot;Identifiant&quot;.
        </p>
      </div>
    );
  }

  if (adoUsername) {
    const hasChanges = (identifiant.trim() && identifiant.trim() !== adoUsername) || password.length >= 6;
    return (
      <div className="bg-card rounded-lg2 shadow-card p-[18px]">
        <h3 className="text-[15px] font-semibold mb-2">Compte ado</h3>
        <p className="text-[14px] text-ink">
          Identifiant : <span className="font-bold">{adoUsername}</span>
        </p>
        {!showEdit ? (
          <button type="button" onClick={startEdit} className="mt-3 text-blue-dark font-bold text-[13px]">
            Modifier l&apos;identifiant / le mot de passe
          </button>
        ) : (
          <div className="mt-3 flex flex-col gap-2.5">
            <div>
              <label className="block text-[11px] font-bold tracking-wide text-faint uppercase mb-1.5">
                Identifiant
              </label>
              <input
                value={identifiant}
                onChange={(e) => setIdentifiant(e.target.value)}
                placeholder="lea.dupont"
                className="w-full border border-border rounded-full px-[18px] py-3 text-[14.5px]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-wide text-faint uppercase mb-1.5">
                Nouveau mot de passe (laisser vide pour ne pas le changer)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                className="w-full border border-border rounded-full px-[18px] py-3 text-[14.5px]"
              />
            </div>
            {error && <p className="text-danger text-[13px] font-medium">{error}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleUpdate}
                disabled={loading || !hasChanges || (password.length > 0 && password.length < 6)}
                className="rounded-full bg-blue-dark text-white font-bold text-[13px] px-4 py-2.5 disabled:opacity-60"
              >
                {loading ? "..." : "Enregistrer"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEdit(false);
                  setError(null);
                  setPassword("");
                }}
                className="rounded-full text-faint font-semibold text-[13px] px-4 py-2.5"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg2 shadow-card p-[18px]">
      <h3 className="text-[15px] font-semibold mb-1">Espace Ados</h3>
      <p className="text-soft text-[13px] mb-3.5">
        Créez un accès autonome pour cet ado (identifiant + mot de passe, sans email personnel).
      </p>
      <div className="flex flex-col gap-2.5">
        <input
          value={identifiant}
          onChange={(e) => setIdentifiant(e.target.value)}
          placeholder="Identifiant (ex: lea.dupont)"
          className="w-full border border-border rounded-full px-[18px] py-3 text-[14.5px]"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe"
          minLength={6}
          className="w-full border border-border rounded-full px-[18px] py-3 text-[14.5px]"
        />
        {error && <p className="text-danger text-[13px] font-medium">{error}</p>}
        <button
          type="button"
          onClick={handleCreate}
          disabled={loading || identifiant.trim().length < 3 || password.length < 6}
          className="rounded-full py-3 font-bold text-[14px] text-white bg-gradient-to-br from-[#57b3ef] to-blue-dark disabled:opacity-60"
        >
          {loading ? "Création..." : "Créer le compte ado"}
        </button>
      </div>
    </div>
  );
}
