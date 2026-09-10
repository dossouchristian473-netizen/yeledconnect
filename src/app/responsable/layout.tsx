import { redirect } from "next/navigation";
import { createClient, getUser } from "@/lib/supabase/server";
import { ResponsableNav } from "@/components/ResponsableNav";

export default async function ResponsableLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const user = await getUser();

  if (!user) redirect("/auth");

  // Vérifie que ce compte a bien le rôle "responsable" (défense en profondeur :
  // le middleware protège déjà la connexion, ceci protège le rôle exact).
  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  const hasResponsableRole = roles?.some((r) => r.role === "responsable");

  if (!hasResponsableRole) {
    redirect("/auth");
  }

  return (
    <div className="max-w-[560px] mx-auto min-h-screen pt-[84px] pb-10">
      {children}
      <ResponsableNav />
    </div>
  );
}
