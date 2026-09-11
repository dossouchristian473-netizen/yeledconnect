import { SubpageHeader } from "@/components/SubpageHeader";
import { PlanningManager } from "@/components/PlanningManager";

export default function ResponsablePlanningPage() {
  return (
    <div>
      <SubpageHeader title="Planning des moniteurs" backHref="/responsable/apercu" />
      <PlanningManager />
    </div>
  );
}
