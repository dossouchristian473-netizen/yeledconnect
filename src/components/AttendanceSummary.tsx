export function AttendanceSummary({ present, absent }: { present: number; absent: number }) {
  return (
    <div className="mx-6 mb-1 flex gap-2.5">
      <div className="flex-1 bg-teal-bg rounded-md2 px-4 py-3 text-center">
        <div className="text-[20px] font-bold text-teal-dark">{present}</div>
        <div className="text-teal-dark text-[11px] font-semibold uppercase tracking-wide">
          présent{present > 1 ? "s" : ""}
        </div>
      </div>
      <div className="flex-1 bg-[#fbe9ea] rounded-md2 px-4 py-3 text-center">
        <div className="text-[20px] font-bold text-danger">{absent}</div>
        <div className="text-danger text-[11px] font-semibold uppercase tracking-wide">
          absent{absent > 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}
