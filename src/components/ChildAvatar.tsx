// Couleur neutre utilisée quand l'enfant n'a pas encore de salle assignée
// (aucune classe déterminée) — les couleurs de classe elles-mêmes viennent
// de rooms.color, jamais codées en dur ici.
const FALLBACK_COLOR = "#B7C5D6";

export function ChildAvatar({
  photoUrl,
  firstName,
  size = 48,
  color,
}: {
  photoUrl?: string | null;
  firstName: string;
  size?: number;
  color?: string | null;
}) {
  if (photoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={photoUrl}
        alt=""
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="rounded-full text-ink/70 flex items-center justify-center font-bold flex-shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.34,
        backgroundColor: color || FALLBACK_COLOR,
      }}
    >
      {firstName[0]?.toUpperCase()}
    </div>
  );
}
