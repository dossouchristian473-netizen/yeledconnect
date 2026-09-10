"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { LogoutButton } from "@/components/LogoutButton";
import { UnreadBadge } from "@/components/UnreadBadge";

export type SpaceNavItem = {
  href: string;
  label: string;
  icon: (props: { className?: string }) => JSX.Element;
  // true = affiche un badge de messages non lus sur cet item (nécessite userId).
  badge?: boolean;
};

// Navigation partagée par les 6 espaces (Parent, Moniteur, Accueil,
// Responsable, Administrateur, Ado) : chaque espace ne fournit que sa liste
// de liens/icônes via son propre composant (BottomNav, MoniteurNav, etc.),
// qui délègue tout le rendu ici. Toujours une barre fixe en haut : sur
// desktop (≥820px) les liens s'affichent en ligne avec la déconnexion ;
// en dessous, un bouton hamburger ouvre un menu plein écran listant les
// mêmes liens, qui se ferme automatiquement au clic sur un lien.
export function SpaceNav({ items, userId }: { items: SpaceNavItem[]; userId?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40 h-[68px] bg-white border-b border-border flex items-center">
        <div className="max-w-[1180px] w-full mx-auto px-6 nav:px-8 flex items-center justify-between">
          <Logo />

          <nav className="hidden nav:flex items-center gap-4 lg:gap-7">
            {items.map(({ href, label, icon: Icon, badge }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 text-[13.5px] font-semibold whitespace-nowrap ${
                  isActive(href) ? "text-blue-dark" : "text-faint"
                }`}
              >
                <span className="relative">
                  <Icon className="w-[19px] h-[19px]" />
                  {badge && userId && <UnreadBadge userId={userId} />}
                </span>
                {label}
              </Link>
            ))}
          </nav>

          <div className="hidden nav:block flex-shrink-0">
            <LogoutButton />
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Ouvrir le menu"
            className="nav:hidden w-10 h-10 flex items-center justify-center rounded-full bg-[#e9eef5] flex-shrink-0"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col nav:hidden">
          <div className="flex items-center justify-between px-6 h-[68px] border-b border-border flex-shrink-0">
            <Logo />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fermer le menu"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[#e9eef5]"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <nav className="flex flex-col items-center justify-center flex-1 gap-7 px-6">
            {items.map(({ href, label, icon: Icon, badge }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2.5 text-[20px] font-semibold ${
                  isActive(href) ? "text-blue-dark" : "text-ink"
                }`}
              >
                <span className="relative">
                  <Icon className="w-6 h-6" />
                  {badge && userId && <UnreadBadge userId={userId} />}
                </span>
                {label}
              </Link>
            ))}
          </nav>

          <div className="px-6 pb-8 flex-shrink-0">
            <LogoutButton variant="row" />
          </div>
        </div>
      )}
    </>
  );
}
