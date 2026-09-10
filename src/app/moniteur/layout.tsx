import { redirect } from "next/navigation";
import { createClient, getUser } from "@/lib/supabase/server";
import { MoniteurNav } from "@/components/MoniteurNav";

export default async function MoniteurLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const user = await getUser();

  if (!user) redirect("/auth");

  // Vérifie que ce compte a bien le rôle "moniteur" (défense en profondeur :
  // le middleware protège déjà la connexion, ceci protège le rôle exact).
  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  const hasMoniteurRole = roles?.some((r) => r.role === "moniteur");

  if (!hasMoniteurRole) {
    redirect("/auth");
  }

  return (
    <div className="max-w-[1180px] mx-auto min-h-screen pt-[84px] pb-10">
      {children}
      <MoniteurNav userId={user.id} />
    </div>
  );
}
