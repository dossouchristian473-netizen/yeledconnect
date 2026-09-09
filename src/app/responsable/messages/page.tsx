import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SubpageHeader } from "@/components/SubpageHeader";
import { ConversationsList } from "@/components/ConversationsList";

export default async function ResponsableMessagesPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q?.trim() ?? "";
  const supabase = createClient();

  let query = supabase
    .from("profiles")
    .select("id, username, user_roles!inner(role)")
    .eq("user_roles.role", "parent")
    .order("username")
    .limit(30);
  if (q) query = query.ilike("username", `%${q}%`);

  const { data: parents } = await query;

  return (
    <div>
      <SubpageHeader title="Messages" backHref="/responsable/apercu" />
      <div className="px-6 flex flex-col gap-4">
        <form action="/responsable/messages" method="get">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Rechercher un parent..."
            className="w-full border border-border bg-card rounded-full px-[18px] py-3.5 text-[15px] shadow-card"
          />
        </form>

        {q && (
          <div className="bg-card rounded-lg2 shadow-card overflow-hidden">
            {!parents || parents.length === 0 ? (
              <p className="text-soft text-[14.5px] text-center py-6">Aucun parent trouvé.</p>
            ) : (
              parents.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/responsable/messages/${p.id}`}
                  className={`flex items-center justify-between gap-3 px-[18px] py-3.5 ${
                    i > 0 ? "border-t border-border" : ""
                  }`}
                >
                  <span className="font-semibold text-[14.5px]">{p.username}</span>
                  <span className="rounded-full bg-blue-bg text-blue-dark font-bold text-[12px] px-3.5 py-2">
                    Message
                  </span>
                </Link>
              ))
            )}
          </div>
        )}

        <ConversationsList basePath="/responsable/messages" />
      </div>
    </div>
  );
}
