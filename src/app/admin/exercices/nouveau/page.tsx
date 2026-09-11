import { createClient } from "@/lib/supabase/server";
import { SubpageHeader } from "@/components/SubpageHeader";
import { NewExerciseForm } from "@/components/NewExerciseForm";

export default async function AdminNouvelExercicePage() {
  const supabase = createClient();
  const { data: rooms } = await supabase.from("rooms").select("id, name").order("name");

  return (
    <div>
      <SubpageHeader title="Nouvel exercice" backHref="/admin/exercices" />
      <NewExerciseForm rooms={rooms ?? []} listHref="/admin/exercices" />
    </div>
  );
}
