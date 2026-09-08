"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton({ variant = "icon" }: { variant?: "icon" | "row" }) {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth");
    router.refresh();
  }

  if (variant === "row") {
    return (
      <button
        onClick={handleLogout}
        className="flex items-center gap-3.5 w-full px-[22px] py-[18px] text-[15px] font-semibold text-danger"
      >
        <LogoutIcon /> Se déconnecter
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      aria-label="Se déconnecter"
      className="w-[38px] h-[38px] rounded-full bg-[#e9eef5] flex items-center justify-center text-ink flex-shrink-0"
    >
      <LogoutIcon className="w-[18px] h-[18px]" />
    </button>
  );
}

function LogoutIcon({ className = "w-[19px] h-[19px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M9 4H6.5A2.5 2.5 0 0 0 4 6.5v11A2.5 2.5 0 0 0 6.5 20H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M14 8l5 4-5 4M19 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
