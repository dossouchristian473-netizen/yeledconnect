"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/responsable/apercu", label: "Aperçu", icon: ChartIcon },
  { href: "/responsable/presences", label: "Présences", icon: CheckIcon },
  { href: "/responsable/salles", label: "Salles", icon: RoomIcon },
  { href: "/responsable/agenda", label: "Agenda", icon: CalendarIcon },
  { href: "/responsable/exercices", label: "Exercices", icon: QuizIcon },
  { href: "/responsable/profil", label: "Profil", icon: UserIcon },
];

export function ResponsableNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed left-1/2 -translate-x-1/2 bottom-[18px] w-[calc(100%-40px)] max-w-[520px] bg-white rounded-[26px] shadow-nav flex justify-around px-1.5 pt-3 pb-2.5">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1 text-[11px] font-semibold px-1 ${
              active ? "text-blue-dark" : "text-faint"
            }`}
          >
            <Icon className="w-[22px] h-[22px]" />
            <span>{label.toUpperCase()}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 20V10M11 20V4M18 20v-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.5 12.3l2.4 2.4 4.6-5.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function RoomIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 11.5 12 4l8 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.5 9.5h17" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 3v3.5M16 3v3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function QuizIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M9 10a3 3 0 1 1 4 2.8c-.7.3-1 .9-1 1.7v.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="18.2" r="0.9" fill="currentColor" />
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
function UserIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="8" r="3.6" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4.5 20c1-4.4 4-6.8 7.5-6.8s6.5 2.4 7.5 6.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
