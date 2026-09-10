import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata = {
  title: "Politique de confidentialité — YeledConnect",
};

export default function ConfidentialitePage() {
  return (
    <div className="max-w-[640px] mx-auto min-h-screen px-6 py-8">
      <Link href="/" className="inline-block mb-6">
        <Logo />
      </Link>

      <h1 className="text-[26px] font-semibold mb-1">Politique de confidentialité</h1>
      <p className="text-faint text-[13px] mb-8">Dernière mise à jour : septembre 2026</p>

      <div className="flex flex-col gap-6 text-[14.5px] leading-relaxed text-ink">
        <section>
          <h2 className="text-[17px] font-semibold mb-2">Qui nous sommes</h2>
          <p>
            YeledConnect est l&apos;application du ministère des enfants d&apos;Impact
            Junior. Elle sert à suivre les enfants inscrits, organiser les équipes de
            moniteurs et faciliter la communication entre les parents et l&apos;équipe
            d&apos;encadrement.
          </p>
        </section>

        <section>
          <h2 className="text-[17px] font-semibold mb-2">Données que nous collectons</h2>
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>Informations de compte : nom, adresse email, numéro de téléphone.</li>
            <li>
              Informations sur les enfants inscrits : prénom, nom, date de naissance,
              photo, allergies et besoins particuliers, coordonnées des parents et
              d&apos;un deuxième parent le cas échéant, contact d&apos;urgence, et
              informations de garde si les parents sont séparés.
            </li>
            <li>Présences et absences aux rencontres du dimanche.</li>
            <li>
              Messages échangés entre parents, moniteurs, responsables et
              administrateurs via la messagerie interne.
            </li>
            <li>
              Comptes rendus et remarques internes rédigés par les moniteurs à propos
              de leur salle et des enfants qui leur sont confiés.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-[17px] font-semibold mb-2">Pourquoi nous les utilisons</h2>
          <p>
            Ces informations servent uniquement au bon fonctionnement du ministère des
            enfants : assurer la sécurité et le suivi de chaque enfant, organiser les
            salles et les équipes, et permettre aux parents de rester en contact avec
            les moniteurs de leurs enfants. Nous ne vendons ni ne partageons ces
            données avec des tiers à des fins commerciales.
          </p>
        </section>

        <section>
          <h2 className="text-[17px] font-semibold mb-2">Qui peut voir quoi</h2>
          <p>
            L&apos;accès aux données est strictement limité selon le rôle de chacun :
            un parent ne voit que les informations de ses propres enfants ; un
            moniteur ne voit que les enfants de sa salle et ses propres notes,
            jamais celles d&apos;un collègue ; les comptes rendus et remarques internes
            des moniteurs ne sont jamais visibles par les parents. Ces règles sont
            appliquées techniquement au niveau de la base de données, pas seulement
            dans l&apos;interface.
          </p>
        </section>

        <section>
          <h2 className="text-[17px] font-semibold mb-2">Hébergement et sécurité</h2>
          <p>
            L&apos;application et la base de données sont hébergées par Supabase, les
            emails transactionnels (confirmation de compte, réinitialisation de mot de
            passe) sont envoyés via Resend. L&apos;accès aux données nécessite une
            authentification, et des règles de sécurité empêchent tout utilisateur
            d&apos;accéder à des informations qui ne le concernent pas.
          </p>
        </section>

        <section>
          <h2 className="text-[17px] font-semibold mb-2">Durée de conservation</h2>
          <p>
            Les données sont conservées tant que le compte reste actif ou que
            l&apos;enfant est inscrit au ministère des enfants. Un parent peut demander
            la suppression de son compte et des données associées à tout moment en
            contactant l&apos;administrateur.
          </p>
        </section>

        <section>
          <h2 className="text-[17px] font-semibold mb-2">Vos droits</h2>
          <p>
            Vous pouvez à tout moment demander à consulter, corriger ou supprimer les
            informations vous concernant ou concernant votre enfant, en écrivant à
            l&apos;adresse ci-dessous.
          </p>
        </section>

        <section>
          <h2 className="text-[17px] font-semibold mb-2">Contact</h2>
          <p>
            Pour toute question sur cette politique ou vos données&nbsp;:{" "}
            <a href="mailto:dossouchristian473@gmail.com" className="text-blue-dark font-semibold">
              dossouchristian473@gmail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
