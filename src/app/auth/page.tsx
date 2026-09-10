"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";

export default function AuthPage() {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [loginMode, setLoginMode] = useState<"email" | "identifiant">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  function deriveUsername(email: string) {
    const local = email.split("@")[0]?.replace(/[^a-zA-Z0-9]/g, "") || "famille";
    return `${local}${Math.floor(100 + Math.random() * 900)}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (tab === "login") {
      const loginEmail =
        loginMode === "identifiant"
          ? `${email.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "")}@yeledconnect.local`
          : email;
      const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
      if (error) {
        setError("Email ou mot de passe incorrect.");
        setLoading(false);
        return;
      }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      if (data.user) {
        // Crée le profil associé (policy: insert autorisé si id = auth.uid()).
        await supabase.from("profiles").insert({
          id: data.user.id,
          username: deriveUsername(email),
        });
        // Le rôle "parent" par défaut doit être attribué par une fonction
        // sécurisée côté serveur (ex: trigger on insert into auth.users),
        // pas depuis le client — voir supabase/schema.sql.
      }
    }

    router.push("/");
    router.refresh();
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div className="max-w-[560px] mx-auto min-h-screen px-6 py-8">
      <Logo />

      <div className="flex items-center gap-3.5 my-6">
        <div>
          <h1 className="text-[23px] leading-tight font-semibold">
            {tab === "login" ? "Bon retour parmi nous 👋" : "Bienvenue ! 👋"}
          </h1>
          <p className="mt-1 text-soft text-[14.5px]">
            {tab === "login"
              ? "Connectez-vous pour déposer vos enfants."
              : "Créez votre compte parent en une minute."}
          </p>
        </div>
      </div>

      <div className="bg-card rounded-lg2 p-6 shadow-card">
        <div className="flex bg-[#eef2f7] rounded-full p-1 mb-5">
          {(["login", "signup"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 py-3 rounded-full text-[15px] font-semibold transition ${
                tab === t ? "bg-white text-ink shadow-sm" : "text-faint"
              }`}
            >
              {t === "login" ? "Connexion" : "Inscription"}
            </button>
          ))}
        </div>

        {tab === "login" && (
          <div className="flex gap-2 mb-4 text-[13px] font-semibold">
            {(["email", "identifiant"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setLoginMode(m)}
                className={`flex-1 py-2 rounded-full border ${
                  loginMode === m ? "border-blue-dark text-blue-dark bg-blue-bg" : "border-border text-faint"
                }`}
              >
                {m === "email" ? "Parent / Staff" : "Ado (identifiant)"}
              </button>
            ))}
          </div>
        )}

        {!(tab === "login" && loginMode === "identifiant") && (
          <>
            <button
              type="button"
              onClick={handleGoogle}
              className="w-full border border-border bg-white rounded-full py-3.5 text-[15px] font-semibold flex items-center justify-center gap-2.5"
            >
              <GoogleIcon /> Continuer avec Google
            </button>

            <div className="flex items-center gap-3 my-5 text-faint text-[11.5px] font-semibold tracking-wide">
              <div className="flex-1 h-px bg-border" /> OU PAR EMAIL <div className="flex-1 h-px bg-border" />
            </div>
          </>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-[11.5px] font-bold tracking-wide text-faint uppercase mb-2">
              {tab === "login" && loginMode === "identifiant" ? "Identifiant" : "Email"}
            </label>
            <input
              type={tab === "login" && loginMode === "identifiant" ? "text" : "email"}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={tab === "login" && loginMode === "identifiant" ? "lea.dupont" : "vous@exemple.com"}
              className="w-full border border-border rounded-full px-[18px] py-3.5 text-[15px]"
            />
          </div>
          <div className="mb-4">
            <label className="block text-[11.5px] font-bold tracking-wide text-faint uppercase mb-2">
              Mot de passe
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

          {error && <p className="text-danger text-[13px] font-medium -mt-2 mb-3.5">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full py-4 text-[16px] font-bold text-white bg-gradient-to-br from-[#57b3ef] to-blue-dark shadow-[0_12px_24px_-10px_rgba(44,134,204,0.55)] disabled:opacity-60"
          >
            {loading ? "..." : tab === "login" ? "Se connecter" : "S'inscrire"}
          </button>
        </form>

        {tab === "login" && loginMode === "email" && (
          <Link
            href="/auth/mot-de-passe-oublie"
            className="block text-center mt-[18px] text-blue text-[14.5px] font-semibold"
          >
            Mot de passe oublié ?
          </Link>
        )}
        {tab === "login" && loginMode === "identifiant" && (
          <p className="text-center mt-[18px] text-faint text-[13px]">
            Mot de passe oublié ? Demandez à un parent ou à l&apos;administrateur.
          </p>
        )}
      </div>

      <p className="text-center text-faint text-[12.5px] mt-6 leading-relaxed px-2.5">
        En continuant vous acceptez la charte du ministère des enfants.
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18">
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.7-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8Z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1C3.3 21.3 7.3 24 12 24Z" />
      <path fill="#FBBC05" d="M5.4 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.6.4-2.4V6.5H1.4A12 12 0 0 0 0 12c0 1.9.5 3.8 1.4 5.5l4-3.1Z" />
      <path fill="#EA4335" d="M12 4.8c1.7 0 3.3.6 4.5 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0 7.3 0 3.3 2.7 1.4 6.5l4 3.1C6.3 6.9 8.9 4.8 12 4.8Z" />
    </svg>
  );
}
