"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SharePhoneCard({
  userId,
  initialPhone,
  initialShared,
}: {
  userId: string;
  initialPhone: string | null;
  initialShared: boolean;
}) {
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [shared, setShared] = useState(initialShared);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function save(nextShared: boolean) {
    setSaving(true);
    setShared(nextShared);
    await supabase
      .from("profiles")
      .update({ phone: phone.trim() || null, share_phone_with_parents: nextShared })
      .eq("id", userId);
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="mt-[18px] bg-card rounded-lg2 shadow-card p-[22px]">
      <h3 className="text-[15px] font-semibold mb-1">Contact pour les parents</h3>
      <p className="text-soft text-[13px] mb-3.5">
        Autorisez les parents des enfants de votre salle à vous appeler ou vous écrire
        sur WhatsApp.
      </p>
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        onBlur={() => shared && save(true)}
        placeholder="06 12 34 56 78"
        className="w-full border border-border rounded-full px-[18px] py-3 text-[14.5px] mb-3.5"
      />
      <div className="flex items-center justify-between">
        <span className="text-[13.5px] font-semibold">Partager avec les parents</span>
        <button
          type="button"
          onClick={() => save(!shared)}
          disabled={saving}
          className={`w-[46px] h-[26px] rounded-full relative transition-colors ${
            shared ? "bg-teal-dark" : "bg-border"
          }`}
        >
          <span
            className={`absolute top-[3px] w-[20px] h-[20px] rounded-full bg-white transition-transform ${
              shared ? "translate-x-[23px]" : "translate-x-[3px]"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
