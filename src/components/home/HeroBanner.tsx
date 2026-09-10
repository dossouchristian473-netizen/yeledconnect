// Bannière statique pour commencer (une seule) — un carrousel avec
// plusieurs bannières nécessiterait une table dédiée, pas encore demandée.
// Le contenu réel (illustration) sera fourni plus tard ; l'espace est
// prévu pour l'accueillir dès qu'il existe.
export function HeroBanner() {
  return (
    <section className="px-6 pt-1">
      <div className="bg-gradient-to-br from-blue-bg to-teal-bg rounded-lg2 shadow-card p-7 flex flex-col items-center text-center gap-3">
        <div
          className="w-full max-w-[200px] aspect-[4/3] rounded-md2 bg-white/60 flex items-center justify-center text-[36px] flex-shrink-0"
          aria-hidden
        >
          🧒
        </div>
        <h1 className="text-[21px] leading-tight font-semibold">
          Bienvenue dans le ministère des enfants
        </h1>
        <p className="text-soft text-[13.5px] max-w-[360px]">
          Découvrez les classes, les événements à venir et les ressources pour accompagner les enfants.
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
