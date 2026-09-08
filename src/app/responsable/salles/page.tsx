import { SubpageHeader } from "@/components/SubpageHeader";
import { RoomsManager } from "@/components/RoomsManager";

export default function ResponsableSallesPage() {
  return (
    <div>
      <SubpageHeader title="Salles" backHref="/responsable/apercu" />
      <RoomsManager newHref="/responsable/salles/nouvelle" />
    </div>
  );
}
