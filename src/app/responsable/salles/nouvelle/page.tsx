import { SubpageHeader } from "@/components/SubpageHeader";
import { NewRoomForm } from "@/components/NewRoomForm";

export default function NouvelleSallePage() {
  return (
    <div>
      <SubpageHeader title="Nouvelle salle" backHref="/responsable/salles" />
      <NewRoomForm redirectHref="/responsable/salles" />
    </div>
  );
}
