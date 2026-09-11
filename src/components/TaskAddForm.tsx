"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Assignee = { id: string; username: string };

export function TaskAddForm({ assignees }: { assignees: Assignee[] }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState(assignees[0]?.id ?? "");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !assignedTo) return;
    setSaving(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error: insertErr } = await supabase.from("tasks").insert({
      title: title.trim(),
      description: description.trim() || null,
      assigned_to: assignedTo,
      due_date: dueDate || null,
      created_by: user?.id ?? null,
    });

    setSaving(false);
    if (insertErr) {
      setError("Impossible de créer la tâche. Réessayez.");
      return;
    }

    setTitle("");
    setDescription("");
    setDueDate("");
    router.refresh();
  }

  if (assignees.length === 0) {
    return <p className="text-soft text-[14px]">Aucun compte trouvé.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-lg2 shadow-card p-6 flex flex-col gap-3.5">
      <h3 className="text-[15px] font-semibold">Nouvelle tâche</h3>
      <div>
        <label className="block text-[11.5px] font-bold tracking-wide text-faint uppercase mb-2">Titre</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ranger la salle Daniel"
          className="w-full border border-border rounded-full px-[18px] py-3.5 text-[15px]"
        />
      </div>
      <div>
        <label className="block text-[11.5px] font-bold tracking-wide text-faint uppercase mb-2">Assignée à</label>
        <select
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          className="w-full border border-border rounded-full px-[18px] py-3.5 text-[15px] bg-white"
        >
          {assignees.map((a) => (
            <option key={a.id} value={a.id}>
              {a.username}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-[11.5px] font-bold tracking-wide text-faint uppercase mb-2">
          Échéance (optionnel)
        </label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full border border-border rounded-full px-[18px] py-3.5 text-[15px]"
        />
      </div>
      <div>
        <label className="block text-[11.5px] font-bold tracking-wide text-faint uppercase mb-2">
          Description (optionnel)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full border border-border rounded-md2 px-4 py-3.5 text-[14.5px] resize-none"
        />
      </div>

      {error && <p className="text-danger text-[13px] font-medium">{error}</p>}

      <button
        type="submit"
        disabled={saving || !title.trim() || !assignedTo}
        className="rounded-full py-3.5 font-bold text-[14.5px] text-white bg-gradient-to-br from-[#57b3ef] to-blue-dark shadow-[0_10px_18px_-8px_rgba(44,134,204,0.5)] disabled:opacity-60"
      >
        {saving ? "Création..." : "Créer la tâche"}
      </button>
    </form>
  );
}
