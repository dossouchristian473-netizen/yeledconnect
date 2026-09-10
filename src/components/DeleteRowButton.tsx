"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function DeleteRowButton({
  table,
  id,
}: {
  table: "events" | "exercises" | "class_announcements";
  id: string;
}) {
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Le clic de confirmation expire pour éviter une suppression accidentelle
  // bien plus tard sur le même bouton.
  useEffect(() => {
    if (!confirming) return;
    const t = setTimeout(() => setConfirming(false), 3000);
    return () => clearTimeout(t);
  }, [confirming]);

  async function handleClick() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setConfirming(false);
    setLoading(true);
    await supabase.from(table).delete().eq("id", id);
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-label={confirming ? "Confirmer la suppression" : "Supprimer"}
      className={`h-9 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-60 ${
        confirming ? "px-3.5 bg-danger text-white font-bold text-[11px] tracking-wide uppercase" : "w-9 bg-[#fbeaea] text-danger"
      }`}
    >
      {confirming ? (
        "Confirmer ?"
      ) : (
        <svg viewBox="0 0 24 24" fill="none" className="w-[16px] h-[16px]">
          <path
            d="M5 6.5h14M9.5 6.5V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 5v1.5M7 6.5l.7 12a2 2 0 0 0 2 1.9h4.6a2 2 0 0 0 2-1.9l.7-12"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
