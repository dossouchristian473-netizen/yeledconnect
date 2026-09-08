# YeledConnect — Espace Parent (vraie application)

Next.js 14 (App Router) + Supabase (Postgres + Auth + Row Level Security).
La sécurité des rôles est appliquée **en base**, pas seulement dans l'interface :
un utilisateur ne peut jamais s'attribuer un rôle, même en modifiant les requêtes
depuis le navigateur (voir `supabase/schema.sql`).

## 1. Créer le projet Supabase

1. Créez un projet sur [supabase.com](https://supabase.com) (offre gratuite suffisante pour démarrer).
2. Dans l'éditeur SQL du projet, collez et exécutez tout le contenu de `supabase/schema.sql`.
3. Dans **Authentication → Providers**, activez Google si vous voulez le bouton
   "Continuer avec Google" (sinon email/mot de passe suffit pour tester).
4. Copiez `.env.local.example` en `.env.local` et remplissez avec les valeurs de
   **Project Settings → API** :
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```

## 2. Lancer le projet

```bash
npm install
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) → redirige vers `/auth`.

## 3. Créer votre premier compte administrateur

1. Inscrivez-vous normalement (vous obtenez automatiquement le rôle `parent`,
   via le trigger `on_profile_created`).
2. Dans l'éditeur SQL Supabase, récupérez votre `id` dans `auth.users`, puis :
   ```sql
   insert into public.user_roles (user_id, role) values ('<votre-uuid>', 'administrateur');
   ```
3. Vous avez maintenant les rôles `parent` + `administrateur` sur le même compte
   — exactement le comportement de cumul de rôles demandé dans `SPEC.md`.

## Ce qui est déjà fonctionnel

- Inscription / connexion (email + mot de passe, Google prêt à activer)
- Attribution automatique et sécurisée du rôle `parent` à l'inscription
  (trigger serveur, pas un choix côté client)
- Accueil : salutation, création de l'espace famille
- Onboarding : coordonnées + ajout d'enfants → écrit réellement dans Supabase
- Enfants : liste réelle depuis la base, ou état vide
- Agenda : lit la table `events` (vide au départ → état "Prochaine étape")
- Profil : rôles réels affichés depuis `user_roles`, déconnexion réelle
- Row Level Security : un parent ne voit/modifie que sa propre famille ;
  personne ne peut s'auto-attribuer un rôle (`user_roles` n'a aucune policy
  d'écriture ouverte — tout passe par les fonctions `assign_role` / `revoke_role`,
  réservées aux administrateurs)

## Prochaines étapes (voir `SPEC.md`)

- Espace Moniteur (`/moniteur/...`) : salle assignée, présences, notes privées
- Espace Accueil (`/accueil-staff/...`) : recherche famille, check-in/out, salles
- Espace Responsable (`/responsable/...`) : vue globale, statistiques
- Back-office Administrateur (`/admin/...`) : gestion des rôles, comptes, salles
- Rappels d'anniversaires du mois (cron Supabase Edge Function ou pg_cron)
- Espace pré-ados (exercices notés)

Le design (couleurs, typographies, composants) est déjà posé dans
`tailwind.config.ts` et les composants `src/components/` — à réutiliser pour
les espaces suivants plutôt qu'en recréer un nouveau.
