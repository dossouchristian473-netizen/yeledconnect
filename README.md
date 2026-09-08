# YeledConnect

Application de gestion du ministère des enfants d'Impact Junior — inscriptions,
présences, salles, notes de suivi, agenda et exercices, avec un cumul de
rôles sécurisé par compte.

**Stack** : [Next.js 14](https://nextjs.org) (App Router) + [Supabase](https://supabase.com)
(Postgres + Auth + Row Level Security). La sécurité des rôles est appliquée
**en base**, pas seulement dans l'interface : un utilisateur ne peut jamais
s'attribuer un rôle lui-même, même en modifiant les requêtes depuis le
navigateur (voir [`supabase/schema.sql`](supabase/schema.sql)).

## Les 5 espaces

Un même compte peut cumuler plusieurs rôles (ex: parent + moniteur) ; un
sélecteur d'espace permet de basculer entre ceux auxquels il a accès.

| Espace | Rôle | Ce qu'on y fait |
|---|---|---|
| **Parent** | `parent` | Inscription des enfants, agenda, suivi des exercices de ses enfants |
| **Moniteur** | `moniteur` | Salle assignée, présences (check-in/out), notes privées sur les enfants |
| **Accueil** | `accueil` | Recherche d'enfant, vérification des personnes autorisées, présences, vue des salles |
| **Responsable** | `responsable` | Tableau de bord (statistiques, occupation des salles, anniversaires du mois), gestion des salles, de l'agenda et des exercices notés |
| **Administrateur** | `administrateur` | Back-office : gestion des comptes et des rôles, affectation des moniteurs aux salles |

Le rôle `parent` est attribué automatiquement à l'inscription ; les autres
rôles sont attribués par un administrateur depuis le back-office.

## Installation

Toutes les instructions détaillées (création du projet Supabase, exécution
du schéma, configuration de `.env.local`, premier compte administrateur)
sont dans [**SETUP.md**](SETUP.md).

```bash
npm install
npm run dev
```
