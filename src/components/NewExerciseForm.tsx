"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Room = { id: string; name: string };
type QuestionDraft = { question: string; choices: [string, string, string, string]; correctIndex: number };

function emptyQuestion(): QuestionDraft {
  return { question: "", choices: ["", "", "", ""], correctIndex: 0 };
}

export function NewExerciseForm({ rooms }: { rooms: Room[] }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [roomId, setRoomId] = useState(rooms[0]?.id ?? "");
  const [questions, setQuestions] = useState<QuestionDraft[]>([emptyQuestion()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  function updateQuestion(i: number, patch: Partial<QuestionDraft>) {
    setQuestions((prev) => prev.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
  }
  function updateChoice(i: number, choiceIdx: number, value: string) {
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== i) return q;
        const choices = [...q.choices] as QuestionDraft["choices"];
        choices[choiceIdx] = value;
        return { ...q, choices };
      })
    );
  }

  const isValid =
    title.trim() &&
    roomId &&
    questions.length > 0 &&
    questions.every((q) => q.question.trim() && q.choices.every((c) => c.trim()));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setSaving(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: exercise, error: exErr } = await supabase
      .from("exercises")
      .insert({ title: title.trim(), description: description.trim() || null, room_id: roomId, created_by: user?.id ?? null })
      .select("id")
      .single();

    if (exErr || !exercise) {
      setError("Impossible de créer l'exercice. Réessayez.");
      setSaving(false);
      return;
    }

    const { error: qErr } = await supabase.from("exercise_questions").insert(
      questions.map((q, i) => ({
        exercise_id: exercise.id,
        position: i,
        question: q.question.trim(),
        choices: q.choices.map((c) => c.trim()),
        correct_index: q.correctIndex,
      }))
    );

    if (qErr) {
      setError("L'exercice a été créé mais les questions n'ont pas pu être enregistrées.");
      setSaving(false);
      return;
    }

    router.push("/responsable/exercices");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="px-6 flex flex-col gap-4">
      <div className="bg-card rounded-lg2 shadow-card p-6 flex flex-col gap-4">
        <div>
          <label className="block text-[11.5px] font-bold tracking-wide text-faint uppercase mb-2">Titre</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Quiz sur le livre de Jonas"
            className="w-full border border-border rounded-full px-[18px] py-3.5 text-[15px]"
          />
        </div>
        <div>
          <label className="block text-[11.5px] font-bold tracking-wide text-faint uppercase mb-2">Salle concernée</label>
          <select
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full border border-border rounded-full px-[18px] py-3.5 text-[15px] bg-white"
          >
            {rooms.length === 0 && <option value="">Aucune salle disponible</option>}
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
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
      </div>

      {questions.map((q, i) => (
        <div key={i} className="bg-card rounded-lg2 shadow-card p-6 flex flex-col gap-3.5 relative">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold text-faint uppercase tracking-wide">Question {i + 1}</span>
            {questions.length > 1 && (
              <button
                type="button"
                onClick={() => setQuestions((prev) => prev.filter((_, idx) => idx !== i))}
                className="text-danger text-[12px] font-bold"
              >
                Retirer
              </button>
            )}
          </div>
          <input
            value={q.question}
            onChange={(e) => updateQuestion(i, { question: e.target.value })}
            placeholder="Qui a été avalé par un grand poisson ?"
            className="w-full border border-border rounded-full px-[18px] py-3.5 text-[15px]"
          />
          <div className="flex flex-col gap-2.5">
            {q.choices.map((choice, ci) => (
              <label key={ci} className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name={`correct-${i}`}
                  checked={q.correctIndex === ci}
                  onChange={() => updateQuestion(i, { correctIndex: ci })}
                  className="w-4 h-4 accent-teal-dark flex-shrink-0"
                />
                <input
                  value={choice}
                  onChange={(e) => updateChoice(i, ci, e.target.value)}
                  placeholder={`Réponse ${ci + 1}`}
                  className="flex-1 border border-border rounded-full px-[16px] py-2.5 text-[14px]"
                />
              </label>
            ))}
          </div>
          <p className="text-faint text-[11.5px]">Cochez la bonne réponse.</p>
        </div>
      ))}

      <button
        type="button"
        onClick={() => setQuestions((prev) => [...prev, emptyQuestion()])}
        className="w-full border-[1.5px] border-dashed border-[#c7d3e0] rounded-full py-3.5 text-blue-dark font-bold text-[14px]"
      >
        + Ajouter une question
      </button>

      {error && <p className="text-danger text-[13px] font-medium">{error}</p>}

      <button
        type="submit"
        disabled={saving || !isValid}
        className="rounded-full py-3.5 font-bold text-[14.5px] text-white bg-gradient-to-br from-[#57b3ef] to-blue-dark shadow-[0_10px_18px_-8px_rgba(44,134,204,0.5)] disabled:opacity-60"
      >
        {saving ? "Création..." : "Créer l'exercice"}
      </button>
    </form>
  );
}
