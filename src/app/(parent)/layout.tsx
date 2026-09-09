import { redirect } from "next/navigation";
import { createClient, getUser } from "@/lib/supabase/server";
import { BottomNav } from "@/components/BottomNav";

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const user = await getUser();

  if (!user) redirect("/auth");

  // Vérifie que ce compte a bien le rôle "parent" (défense en profondeur :
  // le middleware protège déjà la connexion, ceci protège le rôle exact).
  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  const hasParentRole = roles?.some((r) => r.role === "parent");

  if (!hasParentRole) {
    // Compte connecté mais sans rôle Parent : pas d'accès à cet espace.
    redirect("/auth");
  }

  return (
    <div className="max-w-[560px] mx-auto min-h-screen pb-[110px]">
      {children}
      <BottomNav userId={user.id} />
    </div>
  );
}
