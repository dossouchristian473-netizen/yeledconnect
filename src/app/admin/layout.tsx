import { redirect } from "next/navigation";
import { createClient, getUser } from "@/lib/supabase/server";
import { AdminNav } from "@/components/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const user = await getUser();

  if (!user) redirect("/auth");

  // Vérifie que ce compte a bien le rôle "administrateur" (défense en profondeur :
  // le middleware protège déjà la connexion, ceci protège le rôle exact).
  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  const hasAdminRole = roles?.some((r) => r.role === "administrateur");

  if (!hasAdminRole) {
    redirect("/auth");
  }

  return (
    <div className="max-w-[1180px] mx-auto min-h-screen pt-[84px] pb-10">
      {children}
      <AdminNav />
    </div>
  );
}
