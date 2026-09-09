import Link from "next/link";
import { createClient, getUser } from "@/lib/supabase/server";

type Message = {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
};

export async function ConversationsList({ basePath }: { basePath: string }) {
  const supabase = createClient();
  const user = await getUser();

  const { data: messages } = await supabase
    .from("messages")
    .select("id, sender_id, recipient_id, body, created_at, read_at")
    .or(`sender_id.eq.${user!.id},recipient_id.eq.${user!.id}`)
    .order("created_at", { ascending: false });

  const byContact = new Map<string, { last: Message; unread: number }>();
  (messages as Message[] | null)?.forEach((m) => {
    const otherId = m.sender_id === user!.id ? m.recipient_id : m.sender_id;
    const existing = byContact.get(otherId);
    const isUnread = m.recipient_id === user!.id && !m.read_at;
    if (!existing) {
      byContact.set(otherId, { last: m, unread: isUnread ? 1 : 0 });
    } else if (isUnread) {
      existing.unread += 1;
    }
  });

  const contactIds = Array.from(byContact.keys());
  const { data: profiles } = contactIds.length
    ? await supabase.from("contact_profiles").select("id, username").in("id", contactIds)
    : { data: [] as { id: string; username: string }[] };

  function usernameFor(id: string) {
    return profiles?.find((p) => p.id === id)?.username ?? "Utilisateur";
  }

  if (contactIds.length === 0) return null;

  return (
    <div>
      <h3 className="text-[15.5px] font-semibold mb-3">Conversations</h3>
      <div className="bg-card rounded-lg2 shadow-card overflow-hidden">
        {contactIds.map((id, i) => {
          const { last, unread } = byContact.get(id)!;
          return (
            <Link
              key={id}
              href={`${basePath}/${id}`}
              className={`flex items-center justify-between gap-3 px-[18px] py-3.5 ${
                i > 0 ? "border-t border-border" : ""
              }`}
            >
              <div className="min-w-0">
                <div className="font-semibold text-[14.5px] truncate">{usernameFor(id)}</div>
                <p className="text-soft text-[13px] truncate">{last.body}</p>
              </div>
              {unread > 0 && (
                <span className="rounded-full bg-danger text-white font-bold text-[11px] px-2 py-0.5 flex-shrink-0">
                  {unread}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
