# YeledConnect — Cahier des charges

Plateforme web pensée dès le départ pour pouvoir devenir ensuite une application iOS et Android.

Outil pour le ministère des enfants d'Impact Junior : au-delà de l'enregistrement des
arrivées et départs, l'objectif est de suivre les enfants, organiser les équipes et
créer un lien entre parents et moniteurs.

> **Statut actuel** : les 5 espaces fonctionnels existent (Parent, Moniteur, Accueil,
> Responsable, Administrateur), avec authentification, base Supabase, RLS, choix
> multi-rôles, emails (Resend), et déploiement en cours. Ce document intègre une
> deuxième vague d'exigences (v2) à construire par-dessus l'existant — voir la
> section **10** pour ce qui est nouveau et **11** pour ce qui modifie l'existant.

---

## 1. Espace Parent

Les parents peuvent créer leur compte eux-mêmes et :
- ajouter leurs enfants ;
- renseigner leurs informations importantes (âge, allergies, besoins particuliers, personnes autorisées, etc.) ;
- faire le check-in / check-out chaque dimanche ;
- voir dans quelle salle se trouve leur enfant ;
- consulter l'historique des présences ;
- suivre les informations concernant leur enfant ;
- consulter l'agenda, les activités, événements, devoirs et ressources ;
- recevoir des informations/notifications des équipes ;
- contacter les moniteurs de leurs enfants via la messagerie sécurisée (voir section 10.3) ;
- consulter la liste des moniteurs de leurs enfants avec un moyen de les contacter.

*Référence de design (UI exacte à respecter) : `reference/yeledconnect-espace-parent.html`.*

## 2. Espace Moniteur

Chaque moniteur possède son propre espace sécurisé et voit uniquement :
- sa salle ;
- son planning et ses jours d'astreinte ;
- les enfants qui lui sont attribués ;
- leurs informations importantes/allergies ;
- les présences (le moniteur peut désormais les enregistrer lui-même, voir 10.2) ;
- ses notes et observations sur l'évolution des enfants (remarques internes, jamais visibles des parents) ;
- son compte rendu à remplir après chaque dimanche (voir 10.1).

**Un moniteur ne doit jamais pouvoir voir le planning, les notes ou l'espace personnel d'un autre moniteur.**

## 3. Espace Accueil

L'accueil peut :
- rechercher les familles/enfants ;
- gérer les arrivées et départs ;
- attribuer les salles ;
- vérifier les personnes autorisées à récupérer les enfants ;
- enregistrer les présences (en parallèle des moniteurs, voir 10.2).

## 4. Espace Responsable

Le responsable a une vision globale :
- enfants et familles ;
- salles ;
- présences et absences (listes et statistiques complètes) ;
- statistiques ;
- équipes ;
- planning des moniteurs ;
- événements et activités ;
- comptes rendus des dimanches et remarques internes des moniteurs (voir 10.1) ;
- fiche individuelle de chaque enfant, avec historique complet.

## 5. Espace Administrateur / Back-office

L'administrateur a un **accès complet à toutes les fonctionnalités de la plateforme**
et peut effectuer les mêmes actions que n'importe quel autre rôle, en plus de :
- gérer les utilisateurs, enfants, salles ;
- attribuer/retirer les rôles ;
- consulter et modifier les statistiques ;
- gérer les événements et plannings ;
- gérer les paramètres généraux ;
- modifier ou compléter les informations d'un enfant à la place d'un parent (photo,
  champs de la fiche, personnes autorisées, etc.) ;
- ajouter des documents et programmes (PDF, quiz, devoirs) ;
- consulter les comptes rendus et remarques des moniteurs.

**Objectif explicite** : permettre à l'administrateur de résoudre lui-même les
problèmes courants (correction d'une fiche, ajustement d'un planning, etc.) sans
intervention du développeur.

**Tableau de bord** attendu : fréquentation par dimanche, nombre d'enfants par salle,
évolution de la fréquentation, nouvelles familles, présents/absents, etc.

## 6. Rôles et sécurité — TRÈS IMPORTANT

Rôles : `Parent` / `Moniteur` / `Accueil` / `Responsable` / `Administrateur`.

- Un utilisateur peut avoir plusieurs rôles (ex. Parent + Moniteur pour un moniteur qui a lui-même des enfants).
- Les parents peuvent créer leur compte seuls, mais **personne ne peut se déclarer**
  Moniteur, Responsable, Accueil ou Administrateur.
- Ces rôles sont attribués **uniquement par l'Administrateur**.
- Si un parent devient moniteur, on ajoute simplement le rôle Moniteur à son compte
  existant, **sans créer un deuxième compte**.
- L'administrateur doit pouvoir ajouter, retirer ou modifier les rôles,
  désactiver/réactiver un compte et supprimer un compte si nécessaire.
- Les utilisateurs ne doivent voir que les espaces correspondant à leurs vrais rôles.
- **Il doit être impossible de changer de rôle simplement en cliquant sur un bouton**
  (pas d'auto-élévation, côté client ou serveur).
- **Confidentialité** (voir aussi 10.6) : les remarques internes sur les enfants, les
  comptes rendus de dimanche et toute information sensible ne doivent **jamais** être
  accessibles aux parents — la séparation se fait au niveau des policies RLS, pas
  seulement dans l'interface.

## 7. Espace pré-ados / Ados (11 ans et plus)

Espace séparé où les enfants de 11 ans et plus (élargi depuis "pré-ados" vers "ados",
voir 10.7) peuvent voir :
- leurs exercices notés et leur progression ;
- leurs programmes et activités ;
- des devoirs, quiz et documents téléchargeables ;
- un moyen de contacter leurs moniteurs via un système sécurisé.

Connexion des ados sans email personnel : voir section 10.8 pour la solution retenue.

## 8. Rappels d'anniversaires

L'administrateur, les moniteurs et le responsable doivent recevoir des rappels pour
les anniversaires du mois des enfants.

## 9. Programmes, devoirs et documents (toutes classes)

- Ajout des programmes annuels de chaque classe, en PDF, consultables/téléchargeables par les parents.
- Publication de devoirs, quiz, documents téléchargeables.
- Activités à réaliser dans le cahier (instructions numériques).
- Pour les plus petits : chants à apprendre, poèmes, versets, activités additionnelles.
- Gestion de ce contenu : Administrateur (et Responsable pour la publication courante).

---

## 10. Nouvelles exigences (v2) — détail

### 10.1 Comptes rendus et remarques (Moniteur)
- Après chaque dimanche, chaque moniteur remplit un **compte rendu** texte libre pour sa salle.
- Le moniteur peut ajouter des **remarques internes** ciblées sur un enfant en particulier.
- Visibilité : Responsable et Administrateur uniquement. **Jamais le Parent.**
- Un moniteur ne voit que ses propres comptes rendus/remarques (jamais ceux d'un collègue), sauf Responsable/Administrateur qui voient tout.

### 10.2 Présences enrichies
- Les **moniteurs** peuvent désormais enregistrer eux-mêmes les présences de leur salle (en plus de l'Accueil).
- Le système calcule et affiche **automatiquement** la liste des absents à partir des enfants enregistrés et non pointés présents (ex. 100 inscrits, 71 présents pointés → 29 absents générés automatiquement, pas de saisie manuelle des absences).
- Responsable et Administrateur ont accès à l'ensemble des listes et statistiques (présents/absents, par salle, par dimanche, dans le temps).

### 10.3 Messagerie sécurisée
- Parent ↔ Moniteur(s) des enfants du parent.
- Moniteur/Responsable ↔ Parent.
- Administrateur ↔ tous les utilisateurs.
- Ados ↔ leurs Moniteurs (système séparé, adapté à l'espace ados).
- Les parents doivent pouvoir consulter une **liste des moniteurs** de leurs enfants avec un moyen de contact (messagerie interne, et/ou téléphone/WhatsApp selon les autorisations données par le moniteur).
- Toute la messagerie doit respecter les mêmes règles de rôle : un parent ne doit pas pouvoir contacter n'importe quel moniteur, seulement ceux liés à ses enfants.

### 10.4 Fiche enfant / inscription étendue
Champs à ajouter à la fiche enfant existante (allergies, besoins particuliers, personnes autorisées) :
- photo de l'enfant (**obligatoire** à l'inscription) ;
- sujet de prière éventuel ;
- coordonnées complètes des parents (les deux, si applicable) ;
- deuxième parent (nom, coordonnées) ;
- contact d'urgence (distinct des parents) ;
- informations utiles en cas de parents séparés (garde, qui est autorisé à récupérer selon les jours, etc.).

### 10.5 Liste et suivi des enfants (Responsable/Administrateur)
- Liste complète des enfants inscrits, filtrable/recherchable.
- Fiche individuelle complète par enfant.
- Historique des présences/absences.
- Remarques internes et comptes rendus liés à l'enfant.
- Informations importantes consolidées (allergies, besoins, contacts).

### 10.6 Confidentialité — règle transverse
Différenciation stricte des informations visibles selon le rôle :
- **Parent** : voit uniquement les informations publiques et celles concernant ses propres enfants (jamais les remarques internes, jamais les comptes rendus des moniteurs).
- **Moniteur** : voit les enfants de sa salle et ses propres notes ; jamais les notes d'un autre moniteur.
- **Responsable / Administrateur** : accès complet à tout, y compris les informations internes.

Cette séparation doit être appliquée **au niveau des policies RLS** (base de données), pas seulement masquée dans l'interface — cohérent avec le principe déjà posé en section 6.

### 10.7 Espace Ados (élargissement depuis "pré-ados")
- Seuil d'âge : à partir de **11 ans**.
- Contenu : programmes, activités et devoirs, documents, quiz, exercices notés et suivi de progression, contact sécurisé avec les moniteurs.

### 10.8 Connexion des ados sans email personnel — solution retenue
Certains ados n'ont pas d'adresse email. Solution : **compte réel avec email technique caché** (option retenue plutôt qu'un simple profil/PIN rattaché au compte parent, pour permettre à l'ado de se connecter seul depuis son propre appareil) :
- L'administrateur ou le parent crée le compte de l'ado avec un simple **identifiant** (ex. `lea.dupont`).
- Le système génère en interne un email technique non communiqué (ex. `lea.dupont@yeledconnect.local`), utilisé uniquement pour satisfaire Supabase Auth.
- Le compte est créé avec l'email pré-confirmé (`email_confirm: true`) — pas de vérification par email nécessaire pour ce type de compte.
- L'ado se connecte avec **identifiant + mot de passe uniquement** ; l'email technique n'est jamais affiché ni utilisé pour communiquer avec lui.
- Le rôle attribué à ce type de compte est un rôle dédié (ex. `ado`), distinct de `parent`, avec ses propres policies RLS limitées à l'espace Ados.

---

## 11. Ce qui modifie l'existant (à ne pas casser)

- **Policies RLS Administrateur** : à étendre pour un accès complet en lecture/écriture sur toutes les tables (actuellement certaines actions passent par des fonctions dédiées comme `assign_role`/`revoke_role` — le principe de fonctions sécurisées doit être conservé pour les actions sensibles, mais l'accès en lecture/écriture générale doit être élargi).
- **Table `attendance`** : ajouter la logique de génération automatique des absents (vue ou fonction calculée plutôt que des lignes "absent" stockées, pour rester cohérent si un enfant est ajouté après coup).
- **Policies `moniteur_notes`** : déjà conformes au principe "un moniteur ne voit que ses notes" — à réutiliser telle quelle pour les comptes rendus (nouvelle table `moniteur_reports` avec la même logique).
- **Table `children`** : à étendre avec les nouveaux champs (10.4) plutôt que créer une table séparée, pour garder les policies RLS existantes valables sans duplication.
- **Rôle `ado`** : nouveau rôle à ajouter à l'enum `app_role`, avec ses propres policies (accès à ses programmes/devoirs/messagerie uniquement, jamais aux fiches d'autres enfants).

---

## Notes d'implémentation pour la suite

- La sécurité des rôles doit être appliquée côté serveur/base de données (RLS ou
  équivalent), jamais uniquement côté UI — un simple masquage de bouton ne suffit pas.
- Le design system est déjà fixé par la maquette Parent : fond `#f2f6fb`, cartes
  blanches arrondies, logo badge dégradé turquoise, boutons pilule bleus, police
  `Fraunces` pour les titres et `Inter` pour le texte courant, nav du bas flottante.
- Le modèle de données utilise déjà la relation many-to-many utilisateur ↔ rôle
  (`user_roles`), ce qui permet nativement le cumul de rôles et l'ajout du rôle `ado`.
- Pour la messagerie et les documents/PDF, prévoir le stockage de fichiers via
  Supabase Storage avec des policies RLS équivalentes à celles des tables (un
  parent ne doit accéder qu'aux documents/photos liés à ses propres enfants).
