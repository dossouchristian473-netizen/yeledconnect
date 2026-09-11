import { SubpageHeader } from "@/components/SubpageHeader";
import { PlanningManager } from "@/components/PlanningManager";

export default function AdminPlanningPage() {
  return (
    <div>
      <SubpageHeader title="Planning des moniteurs" backHref="/admin/comptes" />
      <PlanningManager />
    </div>
  );
}
