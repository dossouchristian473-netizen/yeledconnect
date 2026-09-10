import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata = {
  title: "Conditions d'utilisation — YeledConnect",
};

export default function ConditionsPage() {
  return (
    <div className="max-w-[640px] mx-auto min-h-screen px-6 py-8">
      <Link href="/" className="inline-block mb-6">
        <Logo />
      </Link>

      <h1 className="text-[26px] font-semibold mb-1">Conditions d&apos;utilisation</h1>
      <p className="text-faint text-[13px] mb-8">Dernière mise à jour : septembre 2026</p>

      <div className="flex flex-col gap-6 text-[14.5px] leading-relaxed text-ink">
        <section>
          <h2 className="text-[17px] font-semibold mb-2">Objet</h2>
          <p>
            YeledConnect est une application réservée au ministère des enfants
            d&apos;Impact Junior. Elle permet aux parents d&apos;inscrire leurs enfants,
            de suivre leur présence et leurs activités, et à l&apos;équipe
            d&apos;encadrement (moniteurs, accueil, responsables, administrateurs)
            d&apos;organiser les salles et le suivi des enfants.
          </p>
        </section>

        <section>
          <h2 className="text-[17px] font-semibold mb-2">Création de compte</h2>
          <p>
            Toute personne peut créer un compte parent. Les rôles Moniteur, Accueil,
            Responsable et Administrateur ne peuvent être attribués que par un
            administrateur déjà en fonction — il n&apos;est pas possible de se les
            attribuer soi-même. Les informations fournies lors de l&apos;inscription
            (coordonnées, informations sur les enfants) doivent être exactes et tenues
            à jour.
          </p>
        </section>

        <section>
          <h2 className="text-[17px] font-semibold mb-2">Utilisation attendue</h2>
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>Utiliser la messagerie interne de façon respectueuse.</li>
            <li>
              Ne pas tenter de contourner les restrictions d&apos;accès aux
              informations d&apos;autres familles ou d&apos;autres moniteurs.
            </li>
            <li>
              Les remarques et comptes rendus internes des moniteurs sont
              confidentiels et destinés uniquement à l&apos;équipe d&apos;encadrement.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-[17px] font-semibold mb-2">Disponibilité</h2>
          <p>
            L&apos;application est fournie « en l&apos;état ». Nous faisons de notre
            mieux pour qu&apos;elle reste disponible et fiable, mais ne pouvons
            garantir une disponibilité continue ni l&apos;absence totale d&apos;erreurs.
          </p>
        </section>

        <section>
          <h2 className="text-[17px] font-semibold mb-2">Modifications</h2>
          <p>
            Ces conditions peuvent évoluer avec le temps, notamment à mesure que de
            nouvelles fonctionnalités sont ajoutées. La date de dernière mise à jour
            en haut de cette page reflète la version en vigueur.
          </p>
        </section>

        <section>
          <h2 className="text-[17px] font-semibold mb-2">Contact</h2>
          <p>
            Pour toute question sur ces conditions&nbsp;:{" "}
            <a href="mailto:dossouchristian473@gmail.com" className="text-blue-dark font-semibold">
              dossouchristian473@gmail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
