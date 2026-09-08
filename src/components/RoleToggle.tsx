"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { AppRole } from "@/lib/roles";

export function RoleToggle({
  userId,
  username,
  role,
  active,
}: {
  userId: string;
  username: string;
  role: AppRole;
  active: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Le clic de confirmation expire pour éviter un retrait accidentel bien
  // plus tard sur le même bouton.
  useEffect(() => {
    if (!confirming) return;
    const t = setTimeout(() => setConfirming(false), 3000);
    return () => clearTimeout(t);
  }, [confirming]);

  async function handleClick() {
    if (active && !confirming) {
      setConfirming(true);
      return;
    }
    setConfirming(false);
    setLoading(true);
    if (active) {
      await supabase.rpc("revoke_role", { _user_id: userId, _role: role });
    } else {
      await supabase.rpc("assign_role", { _user_id: userId, _role: role });
    }
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      title={confirming ? `Cliquez à nouveau pour retirer "${role}" à ${username}` : undefined}
      className={`rounded-full font-bold text-[11px] tracking-wide uppercase px-3.5 py-[7px] disabled:opacity-60 ${
        confirming
          ? "bg-danger text-white"
          : active
          ? "bg-blue-dark text-white"
          : "bg-[#eef2f7] text-faint"
      }`}
    >
      {confirming ? "Confirmer ?" : role}
    </button>
  );
}
