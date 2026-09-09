import { createClient } from "@/lib/supabase/server";
import { unwrapOne } from "@/lib/supabase/one";

type ReportRow = {
  id: string;
  sunday_date: string;
  report: string;
  rooms: { name: string } | { name: string }[] | null;
  profiles: { username: string } | { username: string }[] | null;
};

export async function MoniteurReportsOverview({ date }: { date?: string }) {
  const supabase = createClient();
  const selectedDate = date || new Date().toISOString().slice(0, 10);

  const [{ data: reportsForDate }, { data: recentDates }] = await Promise.all([
    supabase
      .from("moniteur_reports")
      .select("id, sunday_date, report, rooms(name), profiles(username)")
      .eq("sunday_date", selectedDate)
      .order("created_at", { ascending: true }),
    supabase
      .from("moniteur_reports")
      .select("sunday_date")
      .order("sunday_date", { ascending: false })
      .limit(200),
  ]);

  const reports = (reportsForDate as ReportRow[] | null) ?? [];
  const dateOptions = Array.from(new Set((recentDates ?? []).map((r) => r.sunday_date))).slice(0, 8);

  return (
    <div className="px-6 pt-2 flex flex-col gap-4">
      <form method="get" className="flex items-center gap-2.5">
        <input
          type="date"
          name="date"
          defaultValue={selectedDate}
          className="flex-1 border border-border bg-card rounded-full px-[18px] py-3 text-[14.5px] shadow-card"
        />
        <button
          type="submit"
          className="rounded-full bg-blue-dark text-white font-bold text-[13.5px] px-5 py-3 flex-shrink-0"
        >
          Voir
        </button>
      </form>

      {reports.length === 0 ? (
        <p className="text-soft text-[14.5px] text-center pt-8">
          Aucun compte rendu pour cette date.
        </p>
      ) : (
        <div className="flex flex-col gap-3.5">
          {reports.map((r) => {
            const room = unwrapOne<{ name: string }>(r.rooms);
            const moniteur = unwrapOne<{ username: string }>(r.profiles);
            return (
              <div key={r.id} className="bg-card rounded-lg2 shadow-card p-[18px]">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-[15px]">{room?.name ?? "Salle"}</h4>
                  <span className="text-faint text-[12px] font-semibold">{moniteur?.username}</span>
                </div>
                <p className="text-[14px] text-ink whitespace-pre-line">{r.report}</p>
              </div>
            );
          })}
        </div>
      )}

      {dateOptions.length > 0 && (
        <div>
          <h3 className="text-[13.5px] font-semibold mb-2.5 text-faint uppercase tracking-wide">
            Dates avec compte rendu
          </h3>
          <div className="flex flex-wrap gap-2">
            {dateOptions.map((d) => (
              <a
                key={d}
                href={`?date=${d}`}
                className={`rounded-full px-4 py-2 text-[12.5px] font-semibold ${
                  d === selectedDate ? "bg-blue-dark text-white" : "bg-blue-bg text-blue-dark"
                }`}
              >
                {new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
