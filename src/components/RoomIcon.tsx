// Les 4 classes d'âge ont chacune une icône (rooms.icon en base) : shield
// (David), star (Joseph), flame (Gédéon), crown (Daniel).
export function RoomIcon({
  icon,
  className = "w-5 h-5",
}: {
  icon?: string | null;
  className?: string;
}) {
  switch (icon) {
    case "shield":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M12 3.5l6.5 2.4v5.3c0 4.1-2.7 7.4-6.5 8.8-3.8-1.4-6.5-4.7-6.5-8.8V5.9L12 3.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "star":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M12 3.5l2.5 5.4 5.8.6-4.4 3.9 1.3 5.8-5.2-3-5.2 3 1.3-5.8-4.4-3.9 5.8-.6L12 3.5Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "flame":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M12 3.5c1 2 .5 3.2-.3 4.4-1 1.4-2.2 2.6-2.2 4.7a4.5 4.5 0 0 0 9 0c0-1.8-.8-2.9-1.6-3.9.1 1.4-.4 2.2-1.1 2.6.3-2.4-1-4.2-3.8-7.8Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "crown":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M4 9.5l3.2 2.3L12 6l4.8 5.8 3.2-2.3-1.4 8.5H5.4L4 9.5Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      );
  }
}
