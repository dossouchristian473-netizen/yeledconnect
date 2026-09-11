import { SubpageHeader } from "@/components/SubpageHeader";
import { TasksManager } from "@/components/TasksManager";

export default function ResponsableTachesPage() {
  return (
    <div>
      <SubpageHeader title="Tâches" backHref="/responsable/apercu" />
      <TasksManager />
    </div>
  );
}
