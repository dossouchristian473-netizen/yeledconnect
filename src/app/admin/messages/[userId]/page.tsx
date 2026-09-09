import { notFound } from "next/navigation";
import { createClient, getUser } from "@/lib/supabase/server";
import { SubpageHeader } from "@/components/SubpageHeader";
import { MessageThread } from "@/components/MessageThread";

export default async function AdminMessageThreadPage({ params }: { params: { userId: string } }) {
  const supabase = createClient();
  const user = await getUser();

  const { data: contact } = await supabase
    .from("contact_profiles")
    .select("username")
    .eq("id", params.userId)
    .maybeSingle();

  if (!contact) notFound();

  return (
    <div>
      <SubpageHeader title={contact.username} backHref="/admin/messages" />
      <MessageThread currentUserId={user!.id} otherUserId={params.userId} />
    </div>
  );
}
