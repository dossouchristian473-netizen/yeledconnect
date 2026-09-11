import { SubpageHeader } from "@/components/SubpageHeader";
import { TasksManager } from "@/components/TasksManager";

export default function AdminTachesPage() {
  return (
    <div>
      <SubpageHeader title="Tâches" backHref="/admin/comptes" />
      <TasksManager />
    </div>
  );
}
