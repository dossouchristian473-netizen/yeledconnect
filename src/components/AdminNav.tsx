"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin/comptes", label: "Comptes", icon: UsersIcon },
  { href: "/admin/salles", label: "Salles", icon: RoomIcon },
  { href: "/admin/profil", label: "Profil", icon: UserIcon },
];

export function AdminNav() {
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

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M2.5 20c.6-3.6 2.9-5.6 5.5-5.6s4.9 2 5.5 5.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M14.5 20c.4-2.6 1.9-4.2 3.9-4.2 1.7 0 3.1 1.1 3.6 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
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
function UserIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="8" r="3.6" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4.5 20c1-4.4 4-6.8 7.5-6.8s6.5 2.4 7.5 6.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
