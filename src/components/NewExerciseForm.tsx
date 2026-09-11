"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CONTENT_CATEGORIES, type ContentCategory } from "@/lib/exerciseTypes";

type Room = { id: string; name: string };
type QuestionDraft = { question: string; choices: [string, string, string, string]; correctIndex: number };
type ExerciseType = "quiz" | "pdf" | "texte";

function emptyQuestion(): QuestionDraft {
  return { question: "", choices: ["", "", "", ""], correctIndex: 0 };
}

export function NewExerciseForm({ rooms, listHref = "/responsable/exercices" }: { rooms: Room[]; listHref?: string }) {
  const [type, setType] = useState<ExerciseType>("quiz");
  const [contentCategory, setContentCategory] = useState<ContentCategory>("devoir");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [roomId, setRoomId] = useState(rooms[0]?.id ?? "");
  const [questions, setQuestions] = useState<QuestionDraft[]>([emptyQuestion()]);
  const [content, setContent] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
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
    (type === "quiz"
      ? questions.length > 0 && questions.every((q) => q.question.trim() && q.choices.every((c) => c.trim()))
      : type === "texte"
        ? content.trim().length > 0
        : !!pdfFile);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setSaving(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    let filePath: string | null = null;
    if (type === "pdf" && pdfFile) {
      const exerciseId = crypto.randomUUID();
      filePath = `${exerciseId}/${pdfFile.name}`;
      const { error: uploadErr } = await supabase.storage
        .from("exercise-files")
        .upload(filePath, pdfFile, { upsert: true });
      if (uploadErr) {
        setError("Le fichier n'a pas pu être envoyé. Réessayez.");
        setSaving(false);
        return;
      }
      // On réutilise le même id pour la ligne "exercises" que pour le
      // dossier de stockage, par cohérence avec le reste de l'app (photos
      // d'enfants), même si aucune contrainte RLS ne l'exige ici.
      const { error: exErr } = await supabase.from("exercises").insert({
        id: exerciseId,
        title: title.trim(),
        description: description.trim() || null,
        room_id: roomId,
        created_by: user?.id ?? null,
        type,
        file_path: filePath,
      });
      if (exErr) {
        await supabase.storage.from("exercise-files").remove([filePath]);
        setError("Impossible de créer l'exercice. Réessayez.");
        setSaving(false);
        return;
      }
      router.push(listHref);
      router.refresh();
      return;
    }

    const { data: exercise, error: exErr } = await supabase
      .from("exercises")
      .insert({
        title: title.trim(),
        description: description.trim() || null,
        room_id: roomId,
        created_by: user?.id ?? null,
        type,
        content: type === "texte" ? content.trim() : null,
        content_category: type === "texte" ? contentCategory : null,
      })
      .select("id")
      .single();

    if (exErr || !exercise) {
      setError("Impossible de créer l'exercice. Réessayez.");
      setSaving(false);
      return;
    }

    if (type === "quiz") {
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
    }

    router.push(listHref);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="px-6 flex flex-col gap-4">
      <div className="bg-card rounded-lg2 shadow-card p-6 flex flex-col gap-4">
        <div>
          <label className="block text-[11.5px] font-bold tracking-wide text-faint uppercase mb-2">Type</label>
          <div className="flex gap-2">
            {(
              [
                ["quiz", "Quiz noté"],
                ["texte", "Texte libre"],
                ["pdf", "Document PDF"],
              ] as const
            ).map(([t, label]) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 py-2.5 rounded-full border text-[13px] font-semibold ${
                  type === t ? "border-blue-dark bg-blue-bg text-blue-dark" : "border-border text-faint"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
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

      {type === "texte" && (
        <div className="bg-card rounded-lg2 shadow-card p-6 flex flex-col gap-4">
          <div>
            <label className="block text-[11.5px] font-bold tracking-wide text-faint uppercase mb-2">
              Catégorie
            </label>
            <select
              value={contentCategory}
              onChange={(e) => setContentCategory(e.target.value as ContentCategory)}
              className="w-full border border-border rounded-full px-[18px] py-3.5 text-[15px] bg-white"
            >
              {CONTENT_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <p className="text-faint text-[11.5px] mt-1.5">
              Utile pour étiqueter un chant, un poème ou un verset à apprendre par les petits.
            </p>
          </div>
          <div>
            <label className="block text-[11.5px] font-bold tracking-wide text-faint uppercase mb-2">
              Contenu / consignes
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              placeholder="Lisez le chapitre 3 et répondez oralement en famille..."
              className="w-full border border-border rounded-md2 px-4 py-3.5 text-[14.5px] resize-none"
            />
          </div>
        </div>
      )}

      {type === "pdf" && (
        <div className="bg-card rounded-lg2 shadow-card p-6">
          <label className="block text-[11.5px] font-bold tracking-wide text-faint uppercase mb-2">
            Document PDF
          </label>
          <label className="flex-1 border border-border rounded-full px-[18px] py-3 text-[13.5px] text-soft text-center cursor-pointer block">
            {pdfFile ? pdfFile.name : "Choisir un fichier PDF"}
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
      )}

      {type === "quiz" && (
        <>
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
        </>
      )}

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
