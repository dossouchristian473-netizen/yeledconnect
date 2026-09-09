import { SubpageHeader } from "@/components/SubpageHeader";
import { ConversationsList } from "@/components/ConversationsList";

export default function AdminMessagesPage() {
  return (
    <div>
      <SubpageHeader title="Messages" backHref="/admin/comptes" />
      <div className="px-6 flex flex-col gap-4">
        <p className="text-soft text-[13.5px]">
          Retrouvez ici vos conversations. Pour écrire à un nouveau compte, ouvrez sa
          fiche depuis « Comptes » et cliquez sur « Message ».
        </p>
        <ConversationsList basePath="/admin/messages" />
      </div>
    </div>
  );
}
