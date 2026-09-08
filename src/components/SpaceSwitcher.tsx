import Link from "next/link";
import { SPACES } from "@/lib/spaces";
import type { AppRole } from "@/lib/roles";

export function SpaceSwitcher({ roles, current }: { roles: AppRole[]; current: AppRole }) {
  const others = roles.filter((r) => r !== current && SPACES[r]);
  if (others.length === 0) return null;

  return (
    <div className="mt-[18px] bg-card rounded-lg2 shadow-card overflow-hidden">
      <div className="px-[22px] pt-[16px] pb-2 text-[11px] font-bold tracking-wide text-faint uppercase">
        Changer d&apos;espace
      </div>
      {others.map((r) => (
        <Link
          key={r}
          href={SPACES[r].href}
          className="flex items-center justify-between gap-3.5 w-full px-[22px] py-[16px] text-[15px] font-semibold border-t border-border"
        >
          {SPACES[r].label}
          <svg viewBox="0 0 24 24" fill="none" className="w-[15px] h-[15px] text-faint flex-shrink-0">
            <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      ))}
    </div>
  );
}
