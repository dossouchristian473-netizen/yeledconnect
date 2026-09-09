import Link from "next/link";
import { createClient, getUser } from "@/lib/supabase/server";
import { SubpageHeader } from "@/components/SubpageHeader";
import { ConversationsList } from "@/components/ConversationsList";

export default async function MoniteurMessagesPage() {
  const supabase = createClient();
  const user = await getUser();

  const { data: assignments } = await supabase
    .from("moniteur_rooms")
    .select("room_id")
    .eq("moniteur_id", user!.id);
  const roomIds = (assignments ?? []).map((a) => a.room_id);

  const { data: children } = roomIds.length
    ? await supabase.from("children").select("family_id, first_name").in("current_room_id", roomIds)
    : { data: [] as { family_id: string; first_name: string }[] };

  const familyIds = Array.from(new Set((children ?? []).map((c) => c.family_id)));
  const { data: families } = familyIds.length
    ? await supabase.from("families").select("id, parent_id, family_name").in("id", familyIds)
    : { data: [] as { id: string; parent_id: string; family_name: string }[] };

  const parentIds = Array.from(new Set((families ?? []).map((f) => f.parent_id)));
  const { data: parents } = parentIds.length
    ? await supabase.from("contact_profiles").select("id, username").in("id", parentIds)
    : { data: [] as { id: string; username: string }[] };

  function childrenNamesFor(parentId: string) {
    const familyId = families?.find((f) => f.parent_id === parentId)?.id;
    return (children ?? [])
      .filter((c) => c.family_id === familyId)
      .map((c) => c.first_name)
      .join(", ");
  }

  return (
    <div>
      <SubpageHeader title="Messages" backHref="/moniteur/salle" />
      <div className="px-6 flex flex-col gap-4">
        {parents && parents.length > 0 ? (
          <div>
            <h3 className="text-[15.5px] font-semibold mb-3">Parents de votre salle</h3>
            <div className="bg-card rounded-lg2 shadow-card overflow-hidden">
              {parents.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/moniteur/messages/${p.id}`}
                  className={`flex items-center justify-between gap-3 px-[18px] py-3.5 ${
                    i > 0 ? "border-t border-border" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-[14.5px] truncate">{p.username}</div>
                    <div className="text-faint text-[12.5px] mt-0.5">{childrenNamesFor(p.id)}</div>
                  </div>
                  <span className="rounded-full bg-teal-bg text-teal-dark font-bold text-[12px] px-3.5 py-2 flex-shrink-0">
                    Message
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-soft text-[14.5px] text-center pt-8">
            Aucun parent à contacter pour le moment.
          </p>
        )}

        <ConversationsList basePath="/moniteur/messages" />
      </div>
    </div>
  );
}
