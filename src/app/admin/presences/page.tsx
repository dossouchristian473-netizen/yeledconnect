import { SubpageHeader } from "@/components/SubpageHeader";
import { AttendanceOverview } from "@/components/AttendanceOverview";

export default function AdminPresencesPage({ searchParams }: { searchParams: { date?: string } }) {
  return (
    <div>
      <SubpageHeader title="Présences" backHref="/admin/comptes" />
      <AttendanceOverview date={searchParams.date} />
    </div>
  );
}
