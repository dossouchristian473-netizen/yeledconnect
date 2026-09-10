import { SpaceNav, type SpaceNavItem } from "@/components/SpaceNav";

const items: SpaceNavItem[] = [
  { href: "/ado/exercices", label: "Exercices", icon: ExerciseIcon },
  { href: "/ado/messages", label: "Messages", icon: MessageIcon, badge: true },
  { href: "/ado/profil", label: "Profil", icon: UserIcon },
];

export function AdoNav({ userId }: { userId: string }) {
  return <SpaceNav items={items} userId={userId} />;
}

function ExerciseIcon({ className }: { className?: string }) {
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
