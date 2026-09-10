import Link from "next/link";
import { createClient, getUser } from "@/lib/supabase/server";
import { unwrapOne } from "@/lib/supabase/one";
import { Logo } from "@/components/Logo";
import { LogoutButton } from "@/components/LogoutButton";
import { ChildAvatar } from "@/components/ChildAvatar";
import { RoomIcon } from "@/components/RoomIcon";

type Room = { name: string; color: string | null; icon: string | null };

export default async function AdoExercicesPage() {
  const supabase = createClient();
  const user = await getUser();

  const { data: profile } = await supabase.from("profiles").select("username").eq("id", user!.id).single();

  const { data: child } = await supabase
    .from("children")
    .select("id, first_name, photo_url, current_room_id, room:current_room_id(name, color, icon)")
    .eq("ado_user_id", user!.id)
    .maybeSingle();

  const room = child ? unwrapOne<Room>(child.room) : null;

  const { data: exercises } = child?.current_room_id
    ? await supabase
        .from("exercises")
        .select("id, title, description")
        .eq("room_id", child.current_room_id)
    : { data: [] as { id: string; title: string; description: string | null }[] };

  const exerciseIds = (exercises ?? []).map((e) => e.id);
  const { data: submissions } = child && exerciseIds.length
    ? await supabase
        .from("exercise_submissions")
        .select("exercise_id, score, total")
        .eq("child_id", child.id)
        .in("exercise_id", exerciseIds)
    : { data: [] as { exercise_id: string; score: number; total: number }[] };

  function submissionFor(exerciseId: string) {
    return submissions?.find((s) => s.exercise_id === exerciseId) ?? null;
  }

  return (
    <div>
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <Logo />
        <LogoutButton />
      </div>

      <div className="px-6 pt-4 flex items-center gap-3.5">
        <ChildAvatar photoUrl={null} firstName={profile?.username ?? "?"} size={48} color={room?.color} />
        <div>
          <h1 className="text-[22px] leading-tight font-semibold">
            Salut {child?.first_name ?? profile?.username} 👋
          </h1>
          {room && (
            <span
              className="inline-flex items-center gap-1 mt-1 rounded-full px-2.5 py-[3px] text-[11px] font-bold"
              style={{ backgroundColor: room.color ?? "#e7edf5" }}
            >
              <RoomIcon icon={room.icon} className="w-3 h-3" />
              {room.name}
            </span>
          )}
        </div>
      </div>

      <div className="px-6 pt-5">
        <h3 className="text-[15.5px] font-semibold mb-3">Mes exercices</h3>
        {!child ? (
          <p className="text-soft text-[14.5px]">
            Votre compte n&apos;est encore lié à aucune fiche. Contactez un responsable.
          </p>
        ) : !exercises || exercises.length === 0 ? (
          <p className="text-soft text-[14.5px]">Aucun exercice pour le moment.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {exercises.map((ex) => {
              const sub = submissionFor(ex.id);
              return (
                <Link
                  key={ex.id}
                  href={`/ado/exercices/${ex.id}`}
                  className="bg-card rounded-md2 shadow-card p-[18px] flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-[15px] truncate">{ex.title}</div>
                    {ex.description && <p className="text-soft text-[13px] mt-0.5 truncate">{ex.description}</p>}
                  </div>
                  {sub ? (
                    <span className="rounded-full bg-teal-bg text-teal-dark font-bold text-[12px] px-3.5 py-[7px] flex-shrink-0">
                      {sub.score}/{sub.total}
                    </span>
                  ) : (
                    <span className="rounded-full bg-blue-bg text-blue-dark font-bold text-[11px] tracking-wide uppercase px-3.5 py-[7px] flex-shrink-0">
                      À faire
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
