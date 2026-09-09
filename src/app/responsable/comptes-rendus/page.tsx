import { SubpageHeader } from "@/components/SubpageHeader";
import { MoniteurReportsOverview } from "@/components/MoniteurReportsOverview";

export default function ResponsableComptesRendusPage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  return (
    <div>
      <SubpageHeader title="Comptes rendus" backHref="/responsable/presences" />
      <MoniteurReportsOverview date={searchParams.date} />
    </div>
  );
}
