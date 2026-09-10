"use client";

import { useState } from "react";
import { RoomIcon } from "@/components/RoomIcon";

type ClassInfo = {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
  description: string | null;
  ageRange: string;
  moniteurs: string[];
};

export function ClassesGrid({ classes }: { classes: ClassInfo[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = classes.find((c) => c.id === openId) ?? null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {classes.map((c) => (
          <div key={c.id} className="bg-card rounded-lg2 shadow-card p-[18px] text-center">
            <span
              className="w-11 h-11 rounded-full flex items-center justify-center mx-auto mb-2.5"
              style={{ backgroundColor: c.color ?? "#e7edf5" }}
            >
              <RoomIcon icon={c.icon} className="w-5 h-5" />
            </span>
            <h3 className="font-bold text-[15px]">{c.name}</h3>
            <p className="text-faint text-[12.5px] mt-0.5 mb-3">{c.ageRange}</p>
            <button
              type="button"
              onClick={() => setOpenId(c.id)}
              className="rounded-full bg-blue-bg text-blue-dark font-bold text-[11.5px] tracking-wide uppercase px-3.5 py-2"
            >
              Voir descriptif
            </button>
          </div>
        ))}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[70] bg-black/40 flex items-end sm:items-center justify-center"
          onClick={() => setOpenId(null)}
        >
          <div
            className="bg-white rounded-t-[26px] sm:rounded-lg2 w-full sm:max-w-[420px] p-6 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-3">
              <span
                className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: open.color ?? "#e7edf5" }}
              >
                <RoomIcon icon={open.icon} className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-bold text-[17px]">{open.name}</h3>
                <p className="text-faint text-[12.5px]">{open.ageRange}</p>
              </div>
            </div>

            <p className="text-[14px] text-ink leading-relaxed mb-4">
              {open.description || "Aucune description pour le moment."}
            </p>

            <div>
              <div className="text-[11px] font-bold tracking-wide text-faint uppercase mb-1.5">
                Moniteurs assignés
              </div>
              {open.moniteurs.length === 0 ? (
                <p className="text-soft text-[13.5px]">Aucun moniteur assigné pour le moment.</p>
              ) : (
                <p className="text-[13.5px] text-ink">{open.moniteurs.join(", ")}</p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setOpenId(null)}
              className="w-full mt-5 rounded-full border border-border py-3 font-bold text-[13.5px] text-soft"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
}
