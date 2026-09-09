import { SubpageHeader } from "@/components/SubpageHeader";
import { AttendanceOverview } from "@/components/AttendanceOverview";

export default function ResponsablePresencesPage({ searchParams }: { searchParams: { date?: string } }) {
  return (
    <div>
      <SubpageHeader title="Présences" backHref="/responsable/apercu" />
      <AttendanceOverview date={searchParams.date} />
    </div>
  );
}
