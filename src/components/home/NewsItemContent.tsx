"use client";

import { useState } from "react";

// Au-delà de cette longueur le texte dépasse presque toujours 2 lignes sur
// la largeur d'une carte de nouvelle : on propose "Voir plus" seulement là.
const TRUNCATE_THRESHOLD = 90;

export function NewsItemContent({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = content.length > TRUNCATE_THRESHOLD;

  if (!isLong) {
    return <p className="text-soft text-[12.5px] mt-0.5">{content}</p>;
  }

  return (
    <button type="button" onClick={() => setExpanded((v) => !v)} className="text-left">
      <p className={`text-soft text-[12.5px] mt-0.5 ${expanded ? "" : "line-clamp-2"}`}>{content}</p>
      <span className="text-blue-dark font-semibold text-[11.5px] mt-1 inline-block">
        {expanded ? "Voir moins" : "Voir plus"}
      </span>
    </button>
  );
}
