export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <img
        src="/logo.png"
        alt="YeledConnect"
        className="w-9 h-9 rounded-[11px] shadow-[0_6px_14px_-6px_rgba(50,170,180,0.55)] flex-shrink-0 object-cover"
      />
      <span className="font-bold text-[19px] tracking-tight text-ink">YeledConnect</span>
    </div>
  );
}
