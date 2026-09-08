"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  childId: string;
  roomId: string;
  attendanceId: string | null;
  checkedInAt: string | null;
  checkedOutAt: string | null;
};

export function AttendanceButton({ childId, roomId, attendanceId, checkedInAt, checkedOutAt }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const status: "absent" | "present" | "sorti" = !checkedInAt ? "absent" : !checkedOutAt ? "present" : "sorti";

  async function handleClick() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    const nowIso = new Date().toISOString();

    if (status === "absent") {
      await supabase.from("attendance").insert({
        child_id: childId,
        room_id: roomId,
        sunday_date: today,
        checked_in_at: nowIso,
        checked_in_by: user.id,
      });
    } else if (status === "present" && attendanceId) {
      await supabase
        .from("attendance")
        .update({ checked_out_at: nowIso, checked_out_by: user.id })
        .eq("id", attendanceId);
    } else if (status === "sorti" && attendanceId) {
      await supabase.from("attendance").delete().eq("id", attendanceId);
    }

    router.refresh();
    setLoading(false);
  }

  const styles = {
    absent: "bg-blue-bg text-blue-dark",
    present: "bg-teal-bg text-teal-dark",
    sorti: "bg-[#f0f2f5] text-faint",
  } as const;

  const labels = {
    absent: "Marquer présent",
    present: "Marquer sorti",
    sorti: "Sorti ✓",
  } as const;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`rounded-full font-bold text-[12px] tracking-wide px-4 py-2 whitespace-nowrap disabled:opacity-60 ${styles[status]}`}
    >
      {loading ? "..." : labels[status]}
    </button>
  );
}
