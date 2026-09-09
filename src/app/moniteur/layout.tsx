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
    <div className="max-w-[560px] mx-auto min-h-screen pb-[110px]">
      {children}
      <MoniteurNav />
    </div>
  );
}
