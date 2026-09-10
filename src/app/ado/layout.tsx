import { redirect } from "next/navigation";
import { createClient, getUser } from "@/lib/supabase/server";
import { AdoNav } from "@/components/AdoNav";

export default async function AdoLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const user = await getUser();

  if (!user) redirect("/auth");

  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  const hasAdoRole = roles?.some((r) => r.role === "ado");

  if (!hasAdoRole) {
    redirect("/auth");
  }

  return (
    <div className="max-w-[1180px] mx-auto min-h-screen pt-[84px] pb-10">
      {children}
      <AdoNav userId={user.id} />
    </div>
  );
}
