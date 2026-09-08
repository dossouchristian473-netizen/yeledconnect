import { SubpageHeader } from "@/components/SubpageHeader";
import { NewRoomForm } from "@/components/NewRoomForm";

export default function AdminNouvelleSallePage() {
  return (
    <div>
      <SubpageHeader title="Nouvelle salle" backHref="/admin/salles" />
      <NewRoomForm redirectHref="/admin/salles" />
    </div>
  );
}
