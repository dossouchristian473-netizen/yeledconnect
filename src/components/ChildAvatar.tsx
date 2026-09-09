export function ChildAvatar({
  photoUrl,
  firstName,
  size = 48,
}: {
  photoUrl?: string | null;
  firstName: string;
  size?: number;
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
      className="rounded-full bg-gradient-to-br from-[#8ec9f5] to-[#5fa8e6] text-white flex items-center justify-center font-bold flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.34 }}
    >
      {firstName[0]?.toUpperCase()}
    </div>
  );
}
