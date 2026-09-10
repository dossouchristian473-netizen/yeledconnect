"use client";

import { useState } from "react";

// Bouton discret partagé par les 4 sections éditables du hub d'accueil :
// masque le formulaire d'ajout par défaut, l'affiche au clic.
export function SectionEditToggle({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-blue-dark font-bold text-[12px] uppercase tracking-wide"
      >
        {open ? "Fermer" : label}
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}
