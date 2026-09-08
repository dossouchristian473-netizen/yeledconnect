import Link from "next/link";

export function SubpageHeader({ title, backHref = "/accueil" }: { title: string; backHref?: string }) {
  return (
    <div className="flex items-center gap-3.5 px-5 pt-[22px] pb-[18px]">
      <Link
        href={backHref}
        aria-label="Retour"
        className="w-[38px] h-[38px] rounded-full bg-[#e9eef5] flex items-center justify-center flex-shrink-0"
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]">
          <path d="M15 5 8 12l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
      <span className="text-[21px] font-semibold">{title}</span>
    </div>
  );
}
