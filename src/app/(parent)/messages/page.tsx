import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { unwrapOne } from "@/lib/supabase/one";
import { SubpageHeader } from "@/components/SubpageHeader";
import { ConversationsList } from "@/components/ConversationsList";

export default async function MessagesPage() {
  const supabase = createClient();

  const { data: assignments } = await supabase.from("moniteur_rooms").select("moniteur_id, rooms(name)");

  const moniteurIds = Array.from(new Set((assignments ?? []).map((a) => a.moniteur_id)));
  const { data: contacts } = moniteurIds.length
    ? await supabase.from("contact_profiles").select("id, username, phone").in("id", moniteurIds)
    : { data: [] as { id: string; username: string; phone: string | null }[] };

  function roomNamesFor(moniteurId: string) {
    return (assignments ?? [])
      .filter((a) => a.moniteur_id === moniteurId)
      .map((a) => unwrapOne<{ name: string }>(a.rooms)?.name)
      .filter((n): n is string => !!n)
      .join(", ");
  }

  return (
    <div>
      <SubpageHeader
        title="Messages"
        action={
          <Link href="/annonces" className="rounded-full bg-blue-bg text-blue-dark font-bold text-[12px] px-3.5 py-2">
            Annonces
          </Link>
        }
      />
      <div className="px-6 flex flex-col gap-4">
        {contacts && contacts.length > 0 && (
          <div>
            <h3 className="text-[15.5px] font-semibold mb-3">Vos moniteurs</h3>
            <div className="bg-card rounded-lg2 shadow-card overflow-hidden">
              {contacts.map((c, i) => (
                <div
                  key={c.id}
                  className={`flex items-center justify-between gap-3 px-[18px] py-3.5 ${
                    i > 0 ? "border-t border-border" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-[14.5px] truncate">{c.username}</div>
                    <div className="text-faint text-[12.5px] mt-0.5">{roomNamesFor(c.id)}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {c.phone && (
                      <a
                        href={`https://wa.me/${c.phone.replace(/[^0-9]/g, "")}`}
                        className="rounded-full bg-teal-bg text-teal-dark font-bold text-[12px] px-3.5 py-2"
                      >
                        WhatsApp
                      </a>
                    )}
                    <Link
                      href={`/messages/${c.id}`}
                      className="rounded-full bg-blue-dark text-white font-bold text-[12px] px-3.5 py-2"
                    >
                      Message
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <ConversationsList basePath="/messages" />

        {(!contacts || contacts.length === 0) && (
          <div className="flex flex-col items-center text-center px-8 pt-8">
            <h2 className="text-[20px] font-semibold mb-3">Aucun moniteur pour l&apos;instant</h2>
            <p className="text-soft text-[14.5px] leading-relaxed max-w-[340px]">
              Dès qu&apos;un moniteur sera assigné à la salle de votre enfant, vous
              pourrez le contacter ici.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
