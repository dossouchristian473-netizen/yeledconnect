"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UnreadBadge } from "@/components/UnreadBadge";

const items = [
  { href: "/moniteur/salle", label: "Salle", icon: RoomIcon },
  { href: "/moniteur/enfants", label: "Enfants", icon: KidsIcon },
  { href: "/moniteur/compte-rendu", label: "Compte rendu", icon: ReportIcon },
  { href: "/moniteur/messages", label: "Messages", icon: MessageIcon },
  { href: "/moniteur/profil", label: "Profil", icon: UserIcon },
];

export function MoniteurNav({ userId }: { userId: string }) {
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
              active ? "text-teal-dark" : "text-faint"
            }`}
          >
            <span className="relative">
              <Icon className="w-[22px] h-[22px]" />
              {href === "/moniteur/messages" && <UnreadBadge userId={userId} />}
            </span>
            <span>{label.toUpperCase()}</span>
          </Link>
        );
      })}
    </nav>
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
function KidsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M2.5 20c.6-3.6 2.9-5.6 5.5-5.6s4.9 2 5.5 5.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M14.5 20c.4-2.6 1.9-4.2 3.9-4.2 1.7 0 3.1 1.1 3.6 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function ReportIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="4.5" y="3.5" width="15" height="17" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 8.5h8M8 12.5h8M8 16.5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function MessageIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M3.5 6.5A2.5 2.5 0 0 1 6 4h12a2.5 2.5 0 0 1 2.5 2.5v8A2.5 2.5 0 0 1 18 17H9l-5 4v-4.2a2.5 2.5 0 0 1-.5-1.5v-8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
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
