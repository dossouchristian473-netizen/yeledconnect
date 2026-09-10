import Link from "next/link";
import { createClient, getUser } from "@/lib/supabase/server";
import { SubpageHeader } from "@/components/SubpageHeader";
import { ConversationsList } from "@/components/ConversationsList";

export default async function AdoMessagesPage() {
  const supabase = createClient();
  const user = await getUser();

  const { data: child } = await supabase
    .from("children")
    .select("current_room_id")
    .eq("ado_user_id", user!.id)
    .maybeSingle();

  const { data: assignments } = child?.current_room_id
    ? await supabase.from("moniteur_rooms").select("moniteur_id").eq("room_id", child.current_room_id)
    : { data: [] as { moniteur_id: string }[] };

  const moniteurIds = (assignments ?? []).map((a) => a.moniteur_id);
  const { data: moniteurs } = moniteurIds.length
    ? await supabase.from("contact_profiles").select("id, username").in("id", moniteurIds)
    : { data: [] as { id: string; username: string }[] };

  return (
    <div>
      <SubpageHeader title="Messages" backHref="/ado/exercices" />
      <div className="px-6 flex flex-col gap-4">
        {moniteurs && moniteurs.length > 0 ? (
          <div>
            <h3 className="text-[15.5px] font-semibold mb-3">Moniteurs de ma salle</h3>
            <div className="bg-card rounded-lg2 shadow-card overflow-hidden">
              {moniteurs.map((m, i) => (
                <Link
                  key={m.id}
                  href={`/ado/messages/${m.id}`}
                  className={`flex items-center justify-between gap-3 px-[18px] py-3.5 ${
                    i > 0 ? "border-t border-border" : ""
                  }`}
                >
                  <div className="font-semibold text-[14.5px] truncate">{m.username}</div>
                  <span className="rounded-full bg-teal-bg text-teal-dark font-bold text-[12px] px-3.5 py-2 flex-shrink-0">
                    Message
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-soft text-[14.5px] text-center pt-8">
            Aucun moniteur à contacter pour le moment.
          </p>
        )}

        <ConversationsList basePath="/ado/messages" />
      </div>
    </div>
  );
}
