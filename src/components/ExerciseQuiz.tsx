"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Question = { id: string; position: number; question: string; choices: string[] };

export function ExerciseQuiz({
  exerciseId,
  childId,
  questions,
  initialSubmission,
}: {
  exerciseId: string;
  childId: string;
  questions: Question[];
  initialSubmission: { score: number; total: number } | null;
}) {
  const [answers, setAnswers] = useState<number[]>(() => Array(questions.length).fill(-1));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ score: number; total: number } | null>(initialSubmission);
  const router = useRouter();
  const supabase = createClient();

  const allAnswered = answers.every((a) => a >= 0);

  async function handleSubmit() {
    if (!allAnswered) return;
    setSubmitting(true);
    setError(null);

    const { data, error } = await supabase.rpc("submit_exercise", {
      _exercise_id: exerciseId,
      _child_id: childId,
      _answers: answers,
    });

    if (error || !data || data.length === 0) {
      setError("Impossible d'enregistrer les réponses. Réessayez.");
      setSubmitting(false);
      return;
    }

    setResult(data[0]);
    setSubmitting(false);
    router.refresh();
  }

  if (result) {
    return (
      <div className="px-6">
        <div className="bg-card rounded-lg2 shadow-card p-8 flex flex-col items-center text-center">
          <div className="text-[44px] mb-2">{result.score === result.total ? "🎉" : "🎂"}</div>
          <div className="text-[28px] font-bold">
            {result.score}/{result.total}
          </div>
          <p className="text-soft text-[14.5px] mt-2">
            {result.score === result.total ? "Toutes les réponses sont correctes, bravo !" : "Bon travail !"}
          </p>
          <button
            type="button"
            onClick={() => {
              setResult(null);
              setAnswers(Array(questions.length).fill(-1));
            }}
            className="mt-6 rounded-full bg-blue-bg text-blue-dark font-bold text-[13px] px-5 py-2.5"
          >
            Refaire l&apos;exercice
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 flex flex-col gap-3.5">
      {questions.map((q, i) => (
        <div key={q.id} className="bg-card rounded-lg2 shadow-card p-[18px]">
          <div className="font-bold text-[15px] mb-3">
            {i + 1}. {q.question}
          </div>
          <div className="flex flex-col gap-2">
            {q.choices.map((choice, ci) => (
              <label
                key={ci}
                className={`flex items-center gap-2.5 rounded-full px-4 py-3 border ${
                  answers[i] === ci ? "border-blue-dark bg-blue-bg" : "border-border"
                }`}
              >
                <input
                  type="radio"
                  name={`q-${i}`}
                  checked={answers[i] === ci}
                  onChange={() => setAnswers((prev) => prev.map((a, idx) => (idx === i ? ci : a)))}
                  className="w-4 h-4 accent-blue-dark flex-shrink-0"
                />
                <span className="text-[14px]">{choice}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      {error && <p className="text-danger text-[13px] font-medium">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!allAnswered || submitting}
        className="rounded-full py-3.5 font-bold text-[14.5px] text-white bg-gradient-to-br from-[#57b3ef] to-blue-dark shadow-[0_10px_18px_-8px_rgba(44,134,204,0.5)] disabled:opacity-60"
      >
        {submitting ? "Envoi..." : "Valider mes réponses"}
      </button>
    </div>
  );
}
