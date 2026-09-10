// Bannière statique pour commencer (une seule) — un carrousel avec
// plusieurs bannières nécessiterait une table dédiée, pas encore demandée.
export function HeroBanner() {
  return (
    <section className="px-6 pt-1">
      <div className="bg-gradient-to-br from-blue-bg to-teal-bg rounded-lg2 shadow-card p-7 flex flex-col items-center text-center gap-3 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/illustration-enfants.webp"
          alt=""
          className="w-full max-w-[420px] flex-shrink-0"
          aria-hidden
        />
        <h1 className="text-[21px] leading-tight font-semibold">
          Bienvenue chez Yeled Connect : Grandir dans la foi et la joie.
        </h1>
        <p className="text-soft text-[13.5px] max-w-[380px]">
          Découvrez nos classes, suivez les événements et trouvez des ressources pour toute la famille.
        </p>
        <div className="flex flex-wrap gap-2.5 justify-center mt-1">
          <a
            href="#classes"
            className="rounded-full bg-blue-dark text-white font-bold text-[13px] px-5 py-2.5"
          >
            Explorer les classes
          </a>
          <a
            href="#evenements"
            className="rounded-full bg-white text-blue-dark font-bold text-[13px] px-5 py-2.5 border border-blue-dark/15"
          >
            Voir les événements
          </a>
        </div>
      </div>
    </section>
  );
}
