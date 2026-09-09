"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";

export default function ReinitialiserPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Le lien de réinitialisation contient un jeton dans l'URL ; le client
    // Supabase l'échange automatiquement contre une session temporaire.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError("Impossible de mettre à jour le mot de passe. Le lien a peut-être expiré.");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="max-w-[560px] mx-auto min-h-screen px-6 py-8">
      <Logo />

      <div className="my-6">
        <h1 className="text-[23px] leading-tight font-semibold">Nouveau mot de passe</h1>
        <p className="mt-1 text-soft text-[14.5px]">
          Choisissez un nouveau mot de passe pour votre compte.
        </p>
      </div>

      <div className="bg-card rounded-lg2 p-6 shadow-card">
        {!ready ? (
          <p className="text-soft text-[14.5px]">Vérification du lien...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-[11.5px] font-bold tracking-wide text-faint uppercase mb-2">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-border rounded-full px-[18px] py-3.5 text-[15px]"
              />
            </div>
            <div className="mb-4">
              <label className="block text-[11.5px] font-bold tracking-wide text-faint uppercase mb-2">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-border rounded-full px-[18px] py-3.5 text-[15px]"
              />
            </div>

            {error && <p className="text-danger text-[13px] font-medium -mt-2 mb-3.5">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full py-4 text-[16px] font-bold text-white bg-gradient-to-br from-[#57b3ef] to-blue-dark shadow-[0_12px_24px_-10px_rgba(44,134,204,0.55)] disabled:opacity-60"
            >
              {loading ? "..." : "Mettre à jour le mot de passe"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
