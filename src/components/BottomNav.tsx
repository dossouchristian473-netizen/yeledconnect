"use client";

import { SpaceNav, type SpaceNavItem } from "@/components/SpaceNav";

const items: SpaceNavItem[] = [
  { href: "/accueil", label: "Accueil", icon: HomeIcon },
  { href: "/enfants", label: "Enfants", icon: KidsIcon },
  { href: "/agenda", label: "Agenda", icon: CalendarIcon },
  { href: "/messages", label: "Messages", icon: MessageIcon, badge: true },
  { href: "/profil", label: "Profil", icon: UserIcon },
];

export function BottomNav({ userId }: { userId: string }) {
  return <SpaceNav items={items} userId={userId} />;
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 11.5 12 4l8 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M10 20v-5h4v5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
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
function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.5 9.5h17" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 3v3.5M16 3v3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
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
