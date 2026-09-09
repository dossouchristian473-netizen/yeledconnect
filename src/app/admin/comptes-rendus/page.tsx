import { SubpageHeader } from "@/components/SubpageHeader";
import { MoniteurReportsOverview } from "@/components/MoniteurReportsOverview";

export default function AdminComptesRendusPage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  return (
    <div>
      <SubpageHeader title="Comptes rendus" backHref="/admin/presences" />
      <MoniteurReportsOverview date={searchParams.date} />
    </div>
  );
}
