import { SubpageHeader } from "@/components/SubpageHeader";
import { RoomsManager } from "@/components/RoomsManager";

export default function AdminSallesPage() {
  return (
    <div>
      <SubpageHeader title="Salles" backHref="/admin/comptes" />
      <RoomsManager newHref="/admin/salles/nouvelle" />
    </div>
  );
}
