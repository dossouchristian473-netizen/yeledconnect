import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AccueilNav } from "@/components/AccueilNav";

export default async function AccueilStaffLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  // Vérifie que ce compte a bien le rôle "accueil" (défense en profondeur :
  // le middleware protège déjà la connexion, ceci protège le rôle exact).
  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  const hasAccueilRole = roles?.some((r) => r.role === "accueil");

  if (!hasAccueilRole) {
    redirect("/auth");
  }

  return (
    <div className="max-w-[560px] mx-auto min-h-screen pb-[110px]">
      {children}
      <AccueilNav />
    </div>
  );
}
