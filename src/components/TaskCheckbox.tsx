"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function TaskCheckbox({ taskId, initialDone }: { taskId: string; initialDone: boolean }) {
  const [done, setDone] = useState(initialDone);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function toggle() {
    setSaving(true);
    const next = !done;
    const { error } = await supabase.from("tasks").update({ is_done: next }).eq("id", taskId);
    setSaving(false);
    if (!error) {
      setDone(next);
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={saving}
      aria-label={done ? "Marquer comme à faire" : "Marquer comme fait"}
      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 disabled:opacity-60 ${
        done ? "bg-teal-dark border-teal-dark text-white" : "border-border text-transparent"
      }`}
    >
      <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
        <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
