"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function MoniteurReportForm({
  roomId,
  roomName,
  sundayDate,
  initialReport,
}: {
  roomId: string;
  roomName: string;
  sundayDate: string;
  initialReport: string;
}) {
  const [report, setReport] = useState(initialReport);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function save() {
    if (!report.trim()) return;
    setSaving(true);
    setSaved(false);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }

    await supabase.from("moniteur_reports").upsert(
      {
        moniteur_id: user.id,
        room_id: roomId,
        sunday_date: sundayDate,
        report: report.trim(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "moniteur_id,room_id,sunday_date" }
    );

    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="bg-card rounded-lg2 shadow-card p-[22px]">
      <h3 className="text-[15.5px] font-semibold mb-3">{roomName}</h3>
      <textarea
        value={report}
        onChange={(e) => {
          setReport(e.target.value);
          setSaved(false);
        }}
        placeholder="Comment s'est passé ce dimanche dans votre salle ? Ambiance, activités, points à signaler..."
        rows={5}
        className="w-full border border-border rounded-md2 px-4 py-3.5 text-[14.5px] resize-none"
      />
      <div className="flex items-center justify-between mt-3">
        {saved ? (
          <span className="text-teal-dark text-[13px] font-semibold">Enregistré ✓</span>
        ) : (
          <span />
        )}
        <button
          onClick={save}
          disabled={saving || !report.trim()}
          className="rounded-full py-2.5 px-5 font-bold text-[13.5px] text-white bg-gradient-to-br from-[#4fd0be] to-teal-dark shadow-[0_10px_18px_-8px_rgba(31,156,134,0.5)] disabled:opacity-60"
        >
          {saving ? "..." : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}
