import { createClient } from "@/lib/supabase/server";
import { unwrapOne } from "@/lib/supabase/one";
import { TaskAddForm } from "@/components/TaskAddForm";
import { DeleteRowButton } from "@/components/DeleteRowButton";

type Assignee = { username: string };

export async function TasksManager() {
  const supabase = createClient();

  const [{ data: tasks }, { data: profiles }] = await Promise.all([
    supabase
      .from("tasks")
      .select("id, title, description, due_date, is_done, assignee:assigned_to(username)")
      .order("is_done", { ascending: true })
      .order("due_date", { ascending: true, nullsFirst: false }),
    supabase.from("profiles").select("id, username").order("username"),
  ]);

  return (
    <div className="px-6 pt-2 flex flex-col gap-4">
      <TaskAddForm assignees={profiles ?? []} />

      <div>
        <h3 className="text-[15.5px] font-semibold mb-3">Toutes les tâches</h3>
        {!tasks || tasks.length === 0 ? (
          <p className="text-soft text-[14.5px]">Aucune tâche pour le moment.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {tasks.map((t) => {
              const assignee = unwrapOne<Assignee>(t.assignee);
              return (
                <div key={t.id} className="bg-card rounded-md2 shadow-card p-[18px] flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-[14.5px] ${t.is_done ? "line-through text-faint" : ""}`}>
                        {t.title}
                      </span>
                      {t.is_done && (
                        <span className="rounded-full bg-teal-bg text-teal-dark font-bold text-[10.5px] uppercase tracking-wide px-2.5 py-[3px]">
                          Fait
                        </span>
                      )}
                    </div>
                    <p className="text-soft text-[13px] mt-0.5">
                      {assignee?.username ?? "—"}
                      {t.due_date
                        ? ` · échéance ${new Date(t.due_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}`
                        : ""}
                    </p>
                    {t.description && <p className="text-[13px] text-ink mt-1">{t.description}</p>}
                  </div>
                  <DeleteRowButton table="tasks" id={t.id} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
