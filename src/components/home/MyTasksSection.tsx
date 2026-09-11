import { createClient, getUser } from "@/lib/supabase/server";
import { TaskCheckbox } from "@/components/TaskCheckbox";

// Visible par tous les rôles : n'importe qui peut se voir assigner une
// tâche (RLS : un utilisateur ne voit que celles qui lui sont assignées).
export async function MyTasksSection() {
  const supabase = createClient();
  const user = await getUser();

  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, description, due_date, is_done")
    .eq("assigned_to", user!.id)
    .order("is_done", { ascending: true })
    .order("due_date", { ascending: true, nullsFirst: false })
    .limit(8);

  if (!tasks || tasks.length === 0) return null;

  return (
    <section className="px-6 scroll-mt-24">
      <h2 className="text-[16.5px] font-semibold mb-3">Mes tâches</h2>
      <div className="bg-card rounded-lg2 shadow-card overflow-hidden">
        {tasks.map((t, i) => (
          <div
            key={t.id}
            className={`flex items-start gap-3 px-[18px] py-3.5 ${i > 0 ? "border-t border-border" : ""}`}
          >
            <TaskCheckbox taskId={t.id} initialDone={t.is_done} />
            <div className="min-w-0">
              <div className={`font-semibold text-[14px] ${t.is_done ? "line-through text-faint" : ""}`}>
                {t.title}
              </div>
              {t.due_date && (
                <div className="text-faint text-[11.5px] mt-0.5">
                  Échéance {new Date(t.due_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                </div>
              )}
              {t.description && <p className="text-soft text-[13px] mt-1">{t.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
