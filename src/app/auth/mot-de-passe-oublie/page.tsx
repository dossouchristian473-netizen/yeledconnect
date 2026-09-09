"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reinitialiser`,
    });

    if (error) {
      setError("Impossible d'envoyer l'email. Réessayez.");
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <div className="max-w-[560px] mx-auto min-h-screen px-6 py-8">
      <Logo />

      <div className="my-6">
        <h1 className="text-[23px] leading-tight font-semibold">Mot de passe oublié</h1>
        <p className="mt-1 text-soft text-[14.5px]">
          Entrez votre email, on vous envoie un lien pour le réinitialiser.
        </p>
      </div>

      <div className="bg-card rounded-lg2 p-6 shadow-card">
        {sent ? (
          <p className="text-[14.5px] leading-relaxed text-ink">
            Si un compte existe avec cette adresse, un email vient d&apos;être envoyé avec un
            lien de réinitialisation.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-[11.5px] font-bold tracking-wide text-faint uppercase mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                className="w-full border border-border rounded-full px-[18px] py-3.5 text-[15px]"
              />
            </div>

            {error && <p className="text-danger text-[13px] font-medium -mt-2 mb-3.5">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full py-4 text-[16px] font-bold text-white bg-gradient-to-br from-[#57b3ef] to-blue-dark shadow-[0_12px_24px_-10px_rgba(44,134,204,0.55)] disabled:opacity-60"
            >
              {loading ? "..." : "Envoyer le lien"}
            </button>
          </form>
        )}
      </div>

      <Link href="/auth" className="block text-center mt-6 text-blue text-[14.5px] font-semibold">
        Retour à la connexion
      </Link>
    </div>
  );
}
