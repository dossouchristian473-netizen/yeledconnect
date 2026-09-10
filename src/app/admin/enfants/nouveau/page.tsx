import { createClient } from "@/lib/supabase/server";
import { SubpageHeader } from "@/components/SubpageHeader";
import { AdminNewChildForm } from "@/components/AdminNewChildForm";

export default async function AdminNouvelEnfantPage() {
  const supabase = createClient();

  const { data: parentRoles } = await supabase.from("user_roles").select("user_id").eq("role", "parent");
  const parentIds = Array.from(new Set((parentRoles ?? []).map((r) => r.user_id)));

  const { data: parents } = parentIds.length
    ? await supabase.from("profiles").select("id, username").in("id", parentIds).order("username")
    : { data: [] as { id: string; username: string }[] };

  return (
    <div>
      <SubpageHeader title="Nouvel enfant" backHref="/admin/enfants" />
      <AdminNewChildForm parents={parents ?? []} />
    </div>
  );
}
