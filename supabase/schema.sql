-- ============================================================
-- YeledConnect — schéma de base + sécurité des rôles (RLS)
-- À exécuter dans l'éditeur SQL de Supabase (projet neuf).
-- ============================================================

-- ---------- Types ----------
create type public.app_role as enum ('parent', 'moniteur', 'accueil', 'responsable', 'administrateur');

-- ---------- Profils ----------
-- Un profil par utilisateur Supabase Auth (auth.users).
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  first_name text,
  last_name text,
  phone text,
  created_at timestamptz not null default now()
);

-- ---------- Rôles (many-to-many, cumul possible) ----------
-- IMPORTANT : aucune policy INSERT/UPDATE/DELETE pour les utilisateurs standards.
-- Seul le rôle "administrateur" (via une fonction sécurisée) ou le service_role
-- (back-office) peuvent modifier cette table. Un utilisateur ne peut donc jamais
-- s'auto-attribuer un rôle, même en modifiant les requêtes côté client.
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.app_role not null,
  assigned_by uuid references public.profiles(id),
  assigned_at timestamptz not null default now(),
  unique (user_id, role)
);

-- ---------- Familles ----------
create table public.families (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null unique references public.profiles(id) on delete cascade,
  family_name text not null,
  created_at timestamptz not null default now()
);

-- ---------- Salles ----------
create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  age_min int,
  age_max int,
  capacity int
);

-- ---------- Enfants ----------
create table public.children (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  first_name text not null,
  last_name text,
  date_of_birth date,
  allergies text,
  special_needs text,
  current_room_id uuid references public.rooms(id),
  created_at timestamptz not null default now()
);

-- ---------- Personnes autorisées à récupérer un enfant ----------
create table public.authorized_pickups (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  full_name text not null,
  phone text,
  relationship text
);

-- ---------- Présences / check-in / check-out ----------
create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  room_id uuid references public.rooms(id),
  sunday_date date not null,
  checked_in_at timestamptz,
  checked_in_by uuid references public.profiles(id),
  checked_out_at timestamptz,
  checked_out_by uuid references public.profiles(id),
  notes text
);

-- ---------- Événements / agenda ----------
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_date date not null,
  room_id uuid references public.rooms(id), -- null = tous
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- ---------- Assignation moniteur ↔ salle ----------
create table public.moniteur_rooms (
  id uuid primary key default gen_random_uuid(),
  moniteur_id uuid not null references public.profiles(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete cascade,
  unique (moniteur_id, room_id)
);

-- ---------- Notes privées d'un moniteur sur un enfant ----------
create table public.moniteur_notes (
  id uuid primary key default gen_random_uuid(),
  moniteur_id uuid not null references public.profiles(id) on delete cascade,
  child_id uuid not null references public.children(id) on delete cascade,
  note text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Fonction utilitaire : est-ce que l'utilisateur courant a ce rôle ?
-- ============================================================
create or replace function public.has_role(_role public.app_role)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = _role
  );
$$;

-- ============================================================
-- Fonction sécurisée d'attribution de rôle (réservée aux administrateurs)
-- Le front-end appelle CETTE fonction plutôt que d'écrire dans user_roles :
-- select public.assign_role('<user_id>', 'moniteur');
-- ============================================================
create or replace function public.assign_role(_user_id uuid, _role public.app_role)
returns void
language plpgsql
security definer
as $$
begin
  if not public.has_role('administrateur') then
    raise exception 'Seul un administrateur peut attribuer un rôle.';
  end if;
  insert into public.user_roles (user_id, role, assigned_by)
  values (_user_id, _role, auth.uid())
  on conflict (user_id, role) do nothing;
end;
$$;

create or replace function public.revoke_role(_user_id uuid, _role public.app_role)
returns void
language plpgsql
security definer
as $$
begin
  if not public.has_role('administrateur') then
    raise exception 'Seul un administrateur peut retirer un rôle.';
  end if;
  delete from public.user_roles where user_id = _user_id and role = _role;
end;
$$;

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.families enable row level security;
alter table public.rooms enable row level security;
alter table public.children enable row level security;
alter table public.authorized_pickups enable row level security;
alter table public.attendance enable row level security;
alter table public.events enable row level security;
alter table public.moniteur_rooms enable row level security;
alter table public.moniteur_notes enable row level security;

-- ---- profiles ----
create policy "Un utilisateur voit son propre profil"
  on public.profiles for select using (id = auth.uid());
create policy "Le staff voit tous les profils"
  on public.profiles for select using (
    public.has_role('accueil') or public.has_role('responsable') or public.has_role('administrateur')
  );
create policy "Un utilisateur modifie son propre profil"
  on public.profiles for update using (id = auth.uid());
create policy "Un nouvel utilisateur crée son profil à l'inscription"
  on public.profiles for insert with check (id = auth.uid());

-- ---- user_roles ----
-- Lecture uniquement (aucune écriture directe autorisée : passer par assign_role/revoke_role).
create policy "Un utilisateur voit ses propres rôles"
  on public.user_roles for select using (user_id = auth.uid());
create policy "L'administrateur voit tous les rôles"
  on public.user_roles for select using (public.has_role('administrateur'));

-- ---- families ----
create policy "Un parent gère sa propre famille"
  on public.families for all using (parent_id = auth.uid()) with check (parent_id = auth.uid());
create policy "Le staff voit toutes les familles"
  on public.families for select using (
    public.has_role('accueil') or public.has_role('responsable') or public.has_role('administrateur')
  );

-- ---- rooms ----
create policy "Tout utilisateur authentifié peut voir les salles"
  on public.rooms for select using (auth.uid() is not null);
create policy "Responsable/Administrateur gèrent les salles"
  on public.rooms for all using (public.has_role('responsable') or public.has_role('administrateur'));

-- ---- children ----
create policy "Un parent gère les enfants de sa famille"
  on public.children for all using (
    family_id in (select id from public.families where parent_id = auth.uid())
  ) with check (
    family_id in (select id from public.families where parent_id = auth.uid())
  );
create policy "Un moniteur voit les enfants de sa salle"
  on public.children for select using (
    public.has_role('moniteur') and current_room_id in (
      select room_id from public.moniteur_rooms where moniteur_id = auth.uid()
    )
  );
create policy "Accueil/Responsable/Administrateur voient tous les enfants"
  on public.children for select using (
    public.has_role('accueil') or public.has_role('responsable') or public.has_role('administrateur')
  );

-- ---- authorized_pickups ----
create policy "Un parent gère les personnes autorisées de ses enfants"
  on public.authorized_pickups for all using (
    child_id in (
      select c.id from public.children c
      join public.families f on f.id = c.family_id
      where f.parent_id = auth.uid()
    )
  );
create policy "Accueil vérifie les personnes autorisées"
  on public.authorized_pickups for select using (
    public.has_role('accueil') or public.has_role('responsable') or public.has_role('administrateur')
  );

-- ---- attendance ----
create policy "Un parent voit les présences de ses enfants"
  on public.attendance for select using (
    child_id in (
      select c.id from public.children c
      join public.families f on f.id = c.family_id
      where f.parent_id = auth.uid()
    )
  );
create policy "Un moniteur voit/renseigne les présences de sa salle"
  on public.attendance for all using (
    public.has_role('moniteur') and room_id in (
      select room_id from public.moniteur_rooms where moniteur_id = auth.uid()
    )
  );
create policy "Accueil gère le check-in/out"
  on public.attendance for all using (
    public.has_role('accueil') or public.has_role('responsable') or public.has_role('administrateur')
  );

-- ---- events ----
create policy "Tout utilisateur authentifié lit les événements"
  on public.events for select using (auth.uid() is not null);
create policy "Responsable/Administrateur gèrent les événements"
  on public.events for all using (public.has_role('responsable') or public.has_role('administrateur'));

-- ---- moniteur_rooms ----
create policy "Un moniteur voit sa propre affectation"
  on public.moniteur_rooms for select using (moniteur_id = auth.uid());
create policy "Responsable/Administrateur gèrent les affectations"
  on public.moniteur_rooms for all using (public.has_role('responsable') or public.has_role('administrateur'));

-- ---- moniteur_notes ----
-- Un moniteur NE VOIT QUE SES PROPRES notes, jamais celles d'un collègue.
create policy "Un moniteur gère uniquement ses propres notes"
  on public.moniteur_notes for all using (moniteur_id = auth.uid()) with check (moniteur_id = auth.uid());
create policy "Responsable/Administrateur lisent toutes les notes"
  on public.moniteur_notes for select using (public.has_role('responsable') or public.has_role('administrateur'));

-- ============================================================
-- Attribution automatique du rôle "parent" à la création du profil.
-- Sécurisé : ceci est un trigger serveur, pas une policy INSERT ouverte —
-- l'utilisateur ne peut donc pas s'attribuer un autre rôle par ce biais.
-- ============================================================
create or replace function public.handle_new_profile()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.user_roles (user_id, role) values (new.id, 'parent')
  on conflict (user_id, role) do nothing;
  return new;
end;
$$;

create trigger on_profile_created
  after insert on public.profiles
  for each row execute function public.handle_new_profile();

-- ============================================================
-- Création automatique du profil à l'inscription (trigger sur auth.users).
-- Indispensable : tant que l'email n'est pas confirmé, le client n'a pas de
-- session active, donc un insert direct dans public.profiles depuis le
-- navigateur est bloqué par la policy RLS (id = auth.uid()). Ce trigger
-- s'exécute côté serveur, avec les privilèges du définisseur, donc il
-- fonctionne quel que soit l'état de confirmation de l'email.
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, split_part(new.email, '@', 1))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Rappels d'anniversaires du mois.
-- Crée un événement d'agenda (visible par tous, comme les autres événements)
-- pour chaque enfant dont l'anniversaire tombe dans le mois en cours.
-- Idempotent : ne recrée pas un événement déjà généré pour la même date.
-- ============================================================
create or replace function public.sync_birthday_events()
returns void
language plpgsql
security definer
as $$
declare
  child record;
  this_year_birthday date;
begin
  for child in
    select id, first_name, date_of_birth
    from public.children
    where date_of_birth is not null
      and extract(month from date_of_birth) = extract(month from current_date)
  loop
    begin
      this_year_birthday := make_date(
        extract(year from current_date)::int,
        extract(month from child.date_of_birth)::int,
        extract(day from child.date_of_birth)::int
      );
    exception when others then
      -- Anniversaire le 29 février lors d'une année non bissextile : on le
      -- ramène au 28 février plutôt que d'échouer.
      this_year_birthday := make_date(extract(year from current_date)::int, 2, 28);
    end;

    if not exists (
      select 1 from public.events
      where title = '🎂 Anniversaire de ' || child.first_name
        and event_date = this_year_birthday
    ) then
      insert into public.events (title, description, event_date)
      values (
        '🎂 Anniversaire de ' || child.first_name,
        'Pensez à souhaiter un joyeux anniversaire à ' || child.first_name || ' !',
        this_year_birthday
      );
    end if;
  end loop;
end;
$$;

-- Planifie l'exécution automatique le 1er de chaque mois à 6h.
-- Activé le 2026-09-11 sur la base de prod (jobid 1, voir cron.job) suite à
-- la demande de Christian ; une synchronisation manuelle a aussi été
-- lancée immédiatement pour créer les événements du mois en cours.
create extension if not exists pg_cron with schema extensions;
select cron.schedule(
  'sync-birthday-events-monthly',
  '0 6 1 * *',
  $$select public.sync_birthday_events();$$
);

-- ============================================================
-- Espace pré-ados : exercices notés
-- Un exercice est rattaché à une salle (comme les événements), pas à une
-- tranche d'âge codée en dur : on réutilise le découpage par salle déjà en
-- place (ex: une salle "Pré-ados").
-- ============================================================
create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  title text not null,
  description text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.exercise_questions (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  position int not null default 0,
  question text not null,
  choices text[] not null,
  correct_index int not null
);

-- Vue sans la bonne réponse : c'est elle que l'enfant/parent interroge pour
-- répondre au quiz, afin que "correct_index" ne soit jamais exposé côté
-- client (pas d'inspection réseau possible pour tricher).
create view public.exercise_questions_public as
  select id, exercise_id, position, question, choices from public.exercise_questions;

create table public.exercise_submissions (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  child_id uuid not null references public.children(id) on delete cascade,
  answers int[] not null,
  score int not null,
  total int not null,
  submitted_at timestamptz not null default now(),
  unique (exercise_id, child_id)
);

alter table public.exercises enable row level security;
alter table public.exercise_questions enable row level security;
alter table public.exercise_submissions enable row level security;

create policy "Tout utilisateur authentifié lit les exercices"
  on public.exercises for select using (auth.uid() is not null);
create policy "Responsable/Administrateur gèrent les exercices"
  on public.exercises for all using (public.has_role('responsable') or public.has_role('administrateur'));

-- Pas de policy select ouverte sur exercise_questions : elle contient
-- correct_index. La lecture publique passe par exercise_questions_public.
create policy "Responsable/Administrateur gèrent les questions"
  on public.exercise_questions for all using (public.has_role('responsable') or public.has_role('administrateur'));

create policy "Un parent voit les résultats de ses enfants"
  on public.exercise_submissions for select using (
    child_id in (
      select c.id from public.children c
      join public.families f on f.id = c.family_id
      where f.parent_id = auth.uid()
    )
  );
create policy "Un moniteur voit les résultats de sa salle"
  on public.exercise_submissions for select using (
    public.has_role('moniteur') and exercise_id in (
      select e.id from public.exercises e
      join public.moniteur_rooms mr on mr.room_id = e.room_id
      where mr.moniteur_id = auth.uid()
    )
  );
create policy "Responsable/Administrateur voient tous les résultats"
  on public.exercise_submissions for select using (
    public.has_role('responsable') or public.has_role('administrateur')
  );
-- Aucune policy insert/update ouverte : la soumission passe uniquement par
-- submit_exercise ci-dessous, qui calcule le score côté serveur (un enfant
-- ne peut donc pas s'auto-attribuer une note en modifiant la requête).

create or replace function public.submit_exercise(_exercise_id uuid, _child_id uuid, _answers int[])
returns table (score int, total int)
language plpgsql
security definer
as $$
declare
  v_score int := 0;
  v_total int := 0;
  q record;
  i int := 1;
begin
  if not exists (
    select 1 from public.children c
    join public.families f on f.id = c.family_id
    where c.id = _child_id and f.parent_id = auth.uid()
  ) then
    raise exception 'Seul le parent de cet enfant peut soumettre ses réponses.';
  end if;

  for q in
    select correct_index from public.exercise_questions
    where exercise_id = _exercise_id
    order by position
  loop
    v_total := v_total + 1;
    if _answers[i] = q.correct_index then
      v_score := v_score + 1;
    end if;
    i := i + 1;
  end loop;

  insert into public.exercise_submissions (exercise_id, child_id, answers, score, total)
  values (_exercise_id, _child_id, _answers, v_score, v_total)
  on conflict (exercise_id, child_id)
  do update set answers = excluded.answers, score = excluded.score, total = excluded.total, submitted_at = now();

  return query select v_score, v_total;
end;
$$;

-- ============================================================
-- Premier compte administrateur (à exécuter à la main une fois)
-- Remplacer l'UUID par celui de votre utilisateur (table auth.users),
-- après vous être inscrit une première fois comme parent.
-- ============================================================
-- insert into public.user_roles (user_id, role) values ('<uuid-a-remplacer>', 'administrateur');

-- ============================================================
-- v2 — 10.4 Fiche enfant étendue
-- ============================================================
alter table public.children
  add column if not exists photo_url text,
  add column if not exists prayer_subject text,
  add column if not exists home_address text,
  add column if not exists second_parent_name text,
  add column if not exists second_parent_phone text,
  add column if not exists second_parent_email text,
  add column if not exists emergency_contact_name text,
  add column if not exists emergency_contact_phone text,
  add column if not exists emergency_contact_relationship text,
  add column if not exists custody_notes text;

-- photo_url est passée en NOT NULL plus bas dans ce fichier, une fois les
-- flux de création (onboarding + admin) réécrits pour la fournir dès
-- l'insertion — voir la section "Photo obligatoire" en fin de fichier.

-- ---------- Stockage des photos d'enfants ----------
-- Bucket privé : les photos d'enfants ne sont jamais publiques. L'affichage
-- passe par une URL signée à durée limitée générée côté serveur.
insert into storage.buckets (id, name, public)
values ('child-photos', 'child-photos', false)
on conflict (id) do nothing;

-- Convention de chemin : "<child_id>/<fichier>". Le premier segment du
-- chemin identifie l'enfant, sur le même principe que child_id dans les
-- policies des tables ci-dessus.
create policy "Un parent gère la photo de ses enfants"
  on storage.objects for all
  using (
    bucket_id = 'child-photos' and
    (storage.foldername(name))[1]::uuid in (
      select c.id from public.children c
      join public.families f on f.id = c.family_id
      where f.parent_id = auth.uid()
    )
  )
  with check (
    bucket_id = 'child-photos' and
    (storage.foldername(name))[1]::uuid in (
      select c.id from public.children c
      join public.families f on f.id = c.family_id
      where f.parent_id = auth.uid()
    )
  );

create policy "Un moniteur lit les photos des enfants de sa salle"
  on storage.objects for select using (
    bucket_id = 'child-photos' and
    public.has_role('moniteur') and
    (storage.foldername(name))[1]::uuid in (
      select id from public.children where current_room_id in (
        select room_id from public.moniteur_rooms where moniteur_id = auth.uid()
      )
    )
  );

create policy "Accueil/Responsable lisent toutes les photos"
  on storage.objects for select using (
    bucket_id = 'child-photos' and (public.has_role('accueil') or public.has_role('responsable'))
  );

create policy "Administrateur gère toutes les photos"
  on storage.objects for all using (
    bucket_id = 'child-photos' and public.has_role('administrateur')
  ) with check (
    bucket_id = 'child-photos' and public.has_role('administrateur')
  );

-- ============================================================
-- v2 — 11 Administrateur : accès complet en lecture/écriture
-- ============================================================
-- Une policy "ALL" par table, EN PLUS des policies existantes (elles ne sont
-- jamais retirées — Postgres les combine avec OR). Volontairement exclu :
-- `user_roles`, qui doit rester modifiable UNIQUEMENT via les fonctions
-- sécurisées assign_role/revoke_role (l'attribution de rôle est l'action
-- sensible qui doit conserver son garde-fou, voir section 6 et 11 du cahier
-- des charges). `rooms`, `attendance`, `events`, `moniteur_rooms`,
-- `exercises` et `exercise_questions` ont déjà une policy ALL pour
-- l'administrateur — inutile de la dupliquer ici.
create policy "Administrateur a accès complet" on public.profiles for all
  using (public.has_role('administrateur')) with check (public.has_role('administrateur'));
create policy "Administrateur a accès complet" on public.families for all
  using (public.has_role('administrateur')) with check (public.has_role('administrateur'));
create policy "Administrateur a accès complet" on public.children for all
  using (public.has_role('administrateur')) with check (public.has_role('administrateur'));
create policy "Administrateur a accès complet" on public.authorized_pickups for all
  using (public.has_role('administrateur')) with check (public.has_role('administrateur'));
create policy "Administrateur a accès complet" on public.moniteur_notes for all
  using (public.has_role('administrateur')) with check (public.has_role('administrateur'));
create policy "Administrateur a accès complet" on public.exercise_submissions for all
  using (public.has_role('administrateur')) with check (public.has_role('administrateur'));

-- ============================================================
-- v2 — 10.2 Présences enrichies : absences calculées automatiquement
-- ============================================================
-- Un enfant est "absent" un dimanche donné s'il est inscrit dans une salle
-- (current_room_id) et qu'aucune présence (attendance.checked_in_at) n'est
-- enregistrée pour lui à cette date. Fonction calculée plutôt que lignes
-- "absent" stockées (voir section 11) : reste juste même si un enfant
-- change de salle ou est ajouté après coup — aucune donnée à corriger a
-- posteriori.
--
-- SECURITY INVOKER (comportement par défaut, pas de "security definer") :
-- les policies RLS de `children` s'appliquent normalement selon l'appelant.
-- Un moniteur n'obtient donc que les absents de sa salle, l'accueil/le
-- responsable/l'administrateur obtiennent tous les absents, exactement
-- comme pour une requête select classique sur `children`.
create or replace function public.get_absentees(_sunday_date date, _room_id uuid default null)
returns table (child_id uuid, first_name text, last_name text, room_id uuid)
language sql
stable
as $$
  select c.id, c.first_name, c.last_name, c.current_room_id
  from public.children c
  where c.current_room_id is not null
    and (_room_id is null or c.current_room_id = _room_id)
    and not exists (
      select 1 from public.attendance a
      where a.child_id = c.id
        and a.sunday_date = _sunday_date
        and a.checked_in_at is not null
    );
$$;

-- ============================================================
-- v2 — 10.1 Comptes rendus de dimanche (Moniteur)
-- ============================================================
-- Un compte rendu texte libre par moniteur, par salle, par dimanche. Les
-- remarques CIBLÉES sur un enfant en particulier existent déjà via
-- `moniteur_notes` (section 2) — ceci couvre le compte rendu global de la
-- salle, pas enfant par enfant.
create table public.moniteur_reports (
  id uuid primary key default gen_random_uuid(),
  moniteur_id uuid not null references public.profiles(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete cascade,
  sunday_date date not null,
  report text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (moniteur_id, room_id, sunday_date)
);

alter table public.moniteur_reports enable row level security;

-- Même principe que `moniteur_notes` (section 11) : un moniteur NE VOIT QUE
-- SES PROPRES comptes rendus, jamais ceux d'un collègue. Jamais le Parent.
create policy "Un moniteur gère uniquement ses propres comptes rendus"
  on public.moniteur_reports for all using (moniteur_id = auth.uid()) with check (moniteur_id = auth.uid());
create policy "Responsable/Administrateur lisent tous les comptes rendus"
  on public.moniteur_reports for select using (public.has_role('responsable') or public.has_role('administrateur'));
create policy "Administrateur a accès complet" on public.moniteur_reports for all
  using (public.has_role('administrateur')) with check (public.has_role('administrateur'));

-- ============================================================
-- v2 — 10.3 Messagerie sécurisée
-- ============================================================
-- Un moniteur peut choisir de partager son téléphone avec les parents des
-- enfants de sa salle (bouton dans son profil). Redacté par défaut : voir
-- la vue `contact_profiles` plus bas, seule façon dont un parent lit ce
-- champ.
alter table public.profiles add column if not exists share_phone_with_parents boolean not null default false;

-- Variante de has_role() qui teste un utilisateur ARBITRAIRE plutôt que
-- l'utilisateur courant : nécessaire pour vérifier le rôle du DESTINATAIRE
-- d'un message, que l'expéditeur n'a pas forcément le droit de lire via
-- user_roles directement.
create or replace function public.user_has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
security definer
stable
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role);
$$;

-- Règle centrale : qui a le droit d'écrire à qui (section 10.3).
--   - Administrateur <-> tout le monde.
--   - Parent <-> moniteur(s) de la salle actuelle d'un de ses enfants.
--   - Parent <-> responsable (le responsable a une vision globale).
-- SECURITY DEFINER : la fonction doit pouvoir lire families/children/
-- moniteur_rooms au-delà de ce que l'appelant peut voir lui-même via RLS,
-- pour établir le lien parent<->moniteur sans lui donner un accès direct
-- à ces tables.
create or replace function public.can_message(_other_user_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select
    _other_user_id is distinct from auth.uid()
    and (
      public.has_role('administrateur') or public.user_has_role(_other_user_id, 'administrateur')
      or (
        public.has_role('parent') and public.user_has_role(_other_user_id, 'moniteur')
        and exists (
          select 1 from public.families f
          join public.children c on c.family_id = f.id
          join public.moniteur_rooms mr on mr.room_id = c.current_room_id
          where f.parent_id = auth.uid() and mr.moniteur_id = _other_user_id
        )
      )
      or (
        public.has_role('moniteur') and public.user_has_role(_other_user_id, 'parent')
        and exists (
          select 1 from public.families f
          join public.children c on c.family_id = f.id
          join public.moniteur_rooms mr on mr.room_id = c.current_room_id
          where f.parent_id = _other_user_id and mr.moniteur_id = auth.uid()
        )
      )
      or (public.has_role('parent') and public.user_has_role(_other_user_id, 'responsable'))
      or (public.has_role('responsable') and public.user_has_role(_other_user_id, 'parent'))
    );
$$;

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

alter table public.messages enable row level security;

create policy "Un utilisateur voit les messages qu'il a envoyés ou reçus"
  on public.messages for select using (sender_id = auth.uid() or recipient_id = auth.uid());
-- Aucune policy update/delete : un message envoyé ne peut pas être modifié.
-- Le marquage "lu" passe par mark_message_read ci-dessous (colonne read_at
-- uniquement, jamais le corps du message).
create policy "Un utilisateur envoie un message à un contact autorisé"
  on public.messages for insert with check (sender_id = auth.uid() and public.can_message(recipient_id));

create or replace function public.mark_message_read(_message_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.messages set read_at = now()
  where id = _message_id and recipient_id = auth.uid() and read_at is null;
end;
$$;

-- Un parent doit savoir quel moniteur est assigné à la salle de son enfant
-- pour pouvoir le contacter (moniteur_rooms n'était lisible que par le
-- moniteur lui-même et le staff jusqu'ici).
--
-- IMPORTANT — pourquoi ceci passe par une fonction SECURITY DEFINER plutôt
-- qu'une sous-requête inline : une sous-requête directe sur `children`
-- déclenche les policies RLS de `children`, dont celle du moniteur relit
-- `moniteur_rooms` — on revient donc sur la table qu'on est déjà en train
-- d'évaluer, ce qui produit une "infinite recursion detected in policy for
-- relation" côté Postgres (observé en production lors du premier
-- déploiement de cette policy). Une fonction SECURITY DEFINER s'exécute
-- avec les privilèges de son propriétaire, qui contourne la RLS des tables
-- qu'elle lit en interne — exactement comme has_role()/can_message() le
-- font déjà ailleurs dans ce fichier — donc plus de ré-entrée dans la RLS
-- de `children`/`moniteur_rooms`.
create or replace function public.parent_visible_room_ids()
returns setof uuid
language sql
security definer
stable
as $$
  select c.current_room_id from public.children c
  join public.families f on f.id = c.family_id
  where f.parent_id = auth.uid() and c.current_room_id is not null;
$$;

create policy "Un parent voit les moniteurs de la salle de son enfant"
  on public.moniteur_rooms for select using (room_id in (select public.parent_visible_room_ids()));

-- Symétrique : un moniteur doit pouvoir résoudre le parent (via la famille)
-- d'un enfant de sa salle pour le contacter (families n'était lisible que
-- par le parent lui-même et le staff — le moniteur n'est pas "staff").
-- Même raison que ci-dessus : passe par une fonction SECURITY DEFINER pour
-- éviter la même recursion (ici entre `families` et `children`).
create or replace function public.moniteur_visible_family_ids()
returns setof uuid
language sql
security definer
stable
as $$
  select c.family_id from public.children c
  where c.current_room_id in (
    select room_id from public.moniteur_rooms where moniteur_id = auth.uid()
  );
$$;

create policy "Un moniteur voit les familles des enfants de sa salle"
  on public.families for select using (
    public.has_role('moniteur') and id in (select public.moniteur_visible_family_ids())
  );

-- Seule façon pour un utilisateur de résoudre le nom d'un correspondant
-- (les policies `profiles` ne couvrent que soi-même et le staff — pas de
-- policy générale "contacts autorisés" sur la table elle-même, car une
-- policy de ce type exposerait la colonne phone en clair, RLS étant filtré
-- par ligne et non par colonne). Le filtrage par ligne (`where can_message`)
-- est donc fait explicitement DANS la vue plutôt que hérité de `profiles`,
-- et la vue reste volontairement en sémantique "définisseur" (pas de
-- security_invoker) afin de pouvoir lire `phone` en interne pour la
-- redaction — mais can_message() lit auth.uid() de la session réelle,
-- donc le filtrage par ligne reste correct quel que soit l'appelant.
create view public.contact_profiles as
  select id, username, share_phone_with_parents,
    case when share_phone_with_parents then phone else null end as phone
  from public.profiles
  where public.can_message(id);

-- Nécessaire pour que le responsable puisse rechercher un parent à
-- contacter (page Messages) en filtrant par rôle. Lecture seule : l'écriture
-- reste exclusivement réservée à assign_role/revoke_role (section 6/11).
create policy "Responsable voit tous les rôles" on public.user_roles for select using (public.has_role('responsable'));

-- ============================================================
-- Identité visuelle v2 — 4 classes bibliques (David/Joseph/Gédéon/Daniel)
-- ============================================================
-- Chaque salle porte désormais une couleur pastel et une icône en plus de
-- sa tranche d'âge. `icon` est une clé texte simple (shield/star/flame/
-- crown), pas un caractère accentué, pour rester facile à utiliser dans un
-- switch côté application.
alter table public.rooms
  add column if not exists color text,
  add column if not exists icon text;

-- Sur un projet neuf (pas de salles existantes), les 4 classes de
-- référence. Sur un projet déjà en place, ne pas relancer cet insert tel
-- quel : préférer renommer les salles existantes (UPDATE par id) pour
-- conserver les références children.current_room_id / attendance.room_id /
-- events.room_id, qui n'ont pas de cascade — c'est ce qui a été fait pour
-- ce projet (3 salles de test renommées + 1 salle "Joseph" ajoutée), voir
-- le commit associé pour le détail.
insert into public.rooms (name, age_min, age_max, capacity, color, icon)
select * from (values
  ('David', 3, 5, 20, '#A7C7E7', 'shield'),
  ('Joseph', 6, 8, 20, '#FFC9DE', 'star'),
  ('Gédéon', 9, 11, 20, '#FFFACD', 'flame'),
  ('Daniel', 12, null, 20, '#C1E1C1', 'crown')
) as v(name, age_min, age_max, capacity, color, icon)
where not exists (select 1 from public.rooms);

-- ============================================================
-- v2 — 10.7 / 10.8 Espace Ados
-- ============================================================
-- Nouveau rôle, distinct de "parent". `alter type ... add value` doit
-- s'exécuter seul (pas dans le même batch qu'une requête qui utilise déjà
-- 'ado', à cause d'une restriction Postgres sur les nouvelles valeurs
-- d'enum non encore validées).
alter type public.app_role add value if not exists 'ado';

-- Un compte ado est un vrai compte Supabase Auth (email technique caché,
-- ex. lea.dupont@yeledconnect.local, pré-confirmé via l'API Admin — voir
-- src/app/api/ado/create/route.ts, la création ne peut pas se faire par une
-- simple fonction Postgres). Ce compte est relié à SA fiche dans `children`
-- via cette colonne, mise à jour uniquement par cette même route (service
-- role, contourne la RLS après avoir vérifié que l'appelant est bien
-- administrateur ou le parent de cet enfant).
alter table public.children add column if not exists ado_user_id uuid references auth.users(id) on delete set null;
alter table public.children add constraint children_ado_user_id_key unique (ado_user_id);

-- Le trigger d'attribution de rôle à l'inscription doit distinguer un
-- compte ado (email technique) d'un compte parent normal : jamais les deux
-- rôles sur le même compte, et jamais choisi côté client.
create or replace function public.handle_new_profile()
returns trigger
language plpgsql
security definer
as $$
declare
  v_email text;
begin
  select email into v_email from auth.users where id = new.id;
  if v_email like '%@yeledconnect.local' then
    insert into public.user_roles (user_id, role) values (new.id, 'ado')
    on conflict (user_id, role) do nothing;
  else
    insert into public.user_roles (user_id, role) values (new.id, 'parent')
    on conflict (user_id, role) do nothing;
  end if;
  return new;
end;
$$;

create policy "Un ado voit sa propre fiche"
  on public.children for select using (ado_user_id = auth.uid());
create policy "Un ado voit ses propres resultats"
  on public.exercise_submissions for select using (
    child_id in (select id from public.children where ado_user_id = auth.uid())
  );

-- Même raison que parent_visible_room_ids/moniteur_visible_family_ids plus
-- haut (section messagerie) : éviter la récursion RLS entre children et
-- moniteur_rooms en passant par une fonction SECURITY DEFINER.
create or replace function public.ado_own_room_id()
returns uuid
language sql
security definer
stable
as $$
  select current_room_id from public.children where ado_user_id = auth.uid() limit 1;
$$;

create policy "Un ado voit le moniteur de sa salle"
  on public.moniteur_rooms for select using (room_id = public.ado_own_room_id());

-- Un ado peut désormais répondre lui-même à un exercice (avant : seul le
-- parent pouvait soumettre au nom de l'enfant).
create or replace function public.submit_exercise(_exercise_id uuid, _child_id uuid, _answers int[])
returns table (score int, total int)
language plpgsql
security definer
as $$
declare
  v_score int := 0;
  v_total int := 0;
  q record;
  i int := 1;
begin
  if not exists (
    select 1 from public.children c
    join public.families f on f.id = c.family_id
    where c.id = _child_id and f.parent_id = auth.uid()
  ) and not exists (
    select 1 from public.children c
    where c.id = _child_id and c.ado_user_id = auth.uid()
  ) then
    raise exception 'Seul le parent ou l''ado concerné peut soumettre ces réponses.';
  end if;

  for q in
    select correct_index from public.exercise_questions
    where exercise_id = _exercise_id
    order by position
  loop
    v_total := v_total + 1;
    if _answers[i] = q.correct_index then
      v_score := v_score + 1;
    end if;
    i := i + 1;
  end loop;

  insert into public.exercise_submissions (exercise_id, child_id, answers, score, total)
  values (_exercise_id, _child_id, _answers, v_score, v_total)
  on conflict (exercise_id, child_id)
  do update set answers = excluded.answers, score = excluded.score, total = excluded.total, submitted_at = now();

  return query select v_score, v_total;
end;
$$;

-- can_message() étendu : un ado peut contacter le moniteur de sa salle, et
-- réciproquement (même principe que parent<->moniteur plus haut).
create or replace function public.can_message(_other_user_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select
    _other_user_id is distinct from auth.uid()
    and (
      public.has_role('administrateur') or public.user_has_role(_other_user_id, 'administrateur')
      or (
        public.has_role('parent') and public.user_has_role(_other_user_id, 'moniteur')
        and exists (
          select 1 from public.families f
          join public.children c on c.family_id = f.id
          join public.moniteur_rooms mr on mr.room_id = c.current_room_id
          where f.parent_id = auth.uid() and mr.moniteur_id = _other_user_id
        )
      )
      or (
        public.has_role('moniteur') and public.user_has_role(_other_user_id, 'parent')
        and exists (
          select 1 from public.families f
          join public.children c on c.family_id = f.id
          join public.moniteur_rooms mr on mr.room_id = c.current_room_id
          where f.parent_id = _other_user_id and mr.moniteur_id = auth.uid()
        )
      )
      or (public.has_role('parent') and public.user_has_role(_other_user_id, 'responsable'))
      or (public.has_role('responsable') and public.user_has_role(_other_user_id, 'parent'))
      or (
        public.has_role('ado') and public.user_has_role(_other_user_id, 'moniteur')
        and exists (
          select 1 from public.children c
          join public.moniteur_rooms mr on mr.room_id = c.current_room_id
          where c.ado_user_id = auth.uid() and mr.moniteur_id = _other_user_id
        )
      )
      or (
        public.has_role('moniteur') and public.user_has_role(_other_user_id, 'ado')
        and exists (
          select 1 from public.children c
          join public.moniteur_rooms mr on mr.room_id = c.current_room_id
          where c.ado_user_id = _other_user_id and mr.moniteur_id = auth.uid()
        )
      )
    );
$$;

-- Permet à un parent de voir le profil (identifiant) du compte ado qu'il a
-- créé pour son enfant, afin de le lui rappeler depuis la fiche enfant.
-- Ne recrée pas de récursion : ni "children" ni "families" ne lisent
-- "profiles" dans leurs propres policies.
create policy "Un parent voit le profil du compte ado de son enfant"
  on public.profiles for select using (
    id in (
      select c.ado_user_id from public.children c
      join public.families f on f.id = c.family_id
      where f.parent_id = auth.uid() and c.ado_user_id is not null
    )
  );

-- ============================================================
-- Ajustements — Exercices : type (quiz / pdf / texte)
-- ============================================================
-- Un exercice n'est plus forcément un quiz : "content" sert au texte libre
-- (consignes, devoir), "file_path" au PDF téléchargeable (bucket
-- exercise-files, privé comme child-photos — URL signée à la demande).
-- exercise_questions/exercise_submissions restent inchangées et ne
-- s'appliquent qu'aux exercices de type 'quiz'.
alter table public.exercises add column if not exists type text not null default 'quiz' check (type in ('quiz', 'pdf', 'texte'));
alter table public.exercises add column if not exists content text;
alter table public.exercises add column if not exists file_path text;

insert into storage.buckets (id, name, public)
values ('exercise-files', 'exercise-files', false)
on conflict (id) do nothing;

create policy "Tout utilisateur authentifié lit les fichiers d'exercice"
  on storage.objects for select using (
    bucket_id = 'exercise-files' and auth.uid() is not null
  );
create policy "Responsable/Administrateur gèrent les fichiers d'exercice"
  on storage.objects for all using (
    bucket_id = 'exercise-files' and (public.has_role('responsable') or public.has_role('administrateur'))
  ) with check (
    bucket_id = 'exercise-files' and (public.has_role('responsable') or public.has_role('administrateur'))
  );

-- ============================================================
-- Ajustements — Annonces centralisées par classe (10.7 élargi)
-- ============================================================
create table public.class_announcements (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  title text not null,
  content text not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.class_announcements enable row level security;

-- Réutilise parent_visible_room_ids() (déjà défini plus haut pour la
-- messagerie) plutôt qu'une sous-requête inline, pour rester cohérent avec
-- le principe déjà établi d'éviter toute nouvelle récursion RLS.
create policy "Un parent voit les annonces des classes de ses enfants"
  on public.class_announcements for select using (
    room_id in (select public.parent_visible_room_ids())
  );
create policy "Un moniteur gère les annonces de sa salle"
  on public.class_announcements for all using (
    room_id in (select room_id from public.moniteur_rooms where moniteur_id = auth.uid())
  ) with check (
    room_id in (select room_id from public.moniteur_rooms where moniteur_id = auth.uid())
  );
create policy "Responsable/Administrateur gèrent toutes les annonces"
  on public.class_announcements for all using (
    public.has_role('responsable') or public.has_role('administrateur')
  ) with check (
    public.has_role('responsable') or public.has_role('administrateur')
  );

-- ============================================================
-- Photo obligatoire (suite de la section 10.4 plus haut)
-- ============================================================
-- onboarding/page.tsx et AdminNewChildForm.tsx génèrent désormais l'id de
-- l'enfant côté client et fournissent photo_url dès l'INSERT (avec
-- suppression de la ligne si l'upload échoue), donc plus aucune fenêtre où
-- une fiche existe sans photo. Appliqué le 2026-09-10 après correction des
-- 3 fiches historiques (Léo, Noa, Mia) qui avaient été créées avant cette
-- règle et n'avaient pas de photo.
alter table public.children alter column photo_url set not null;

-- ============================================================
-- Hub d'accueil partagé (écran "Accueil" de chaque espace — à ne pas
-- confondre avec l'espace "Accueil" qui est le rôle réception/check-in).
-- Page identique pour les 5 rôles Parent/Moniteur/Accueil/Responsable/
-- Administrateur : hero, classes, événements à venir (table `events`
-- déjà existante, réutilisée telle quelle), photos, nouvelles, ressources
-- spirituelles. Édition réservée à Responsable/Administrateur, en lecture
-- seule pour tous les autres — appliqué en RLS, pas seulement dans l'UI.
-- ============================================================

-- Descriptif affiché dans le detail "Voir Descriptif" d'une classe.
-- Éditable par Responsable/Administrateur depuis la modale "Voir
-- descriptif" du hub d'accueil (même RLS que le reste de rooms : policy
-- "Responsable/Administrateur gèrent les salles" déjà en place plus haut).
alter table public.rooms add column if not exists description text;
-- Programme des thèmes/activités prévus pour cette classe sur l'année,
-- éditable au même endroit que la description.
alter table public.rooms add column if not exists program text;

create table public.news_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  image_path text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  is_published boolean not null default true
);

create table public.home_photos (
  id uuid primary key default gen_random_uuid(),
  photo_path text not null,
  caption text,
  photo_date date,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  is_published boolean not null default true
);

create table public.spiritual_resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  url text not null,
  resource_type text not null default 'lien' check (resource_type in ('lien', 'video')),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  is_published boolean not null default true
);

alter table public.news_posts enable row level security;
alter table public.home_photos enable row level security;
alter table public.spiritual_resources enable row level security;

-- Chaque table : lecture des éléments publiés pour tout utilisateur
-- authentifié, lecture totale + écriture réservées à Responsable/
-- Administrateur (is_published sert de désactivation "douce" — jamais de
-- suppression physique nécessaire pour dépublier un contenu).
create policy "Lecture des nouvelles publiées ou par le staff"
  on public.news_posts for select using (
    is_published or public.has_role('responsable') or public.has_role('administrateur')
  );
create policy "Responsable/Administrateur gèrent les nouvelles"
  on public.news_posts for all using (
    public.has_role('responsable') or public.has_role('administrateur')
  ) with check (
    public.has_role('responsable') or public.has_role('administrateur')
  );

create policy "Lecture des photos publiées ou par le staff"
  on public.home_photos for select using (
    is_published or public.has_role('responsable') or public.has_role('administrateur')
  );
create policy "Responsable/Administrateur gèrent les photos d'accueil"
  on public.home_photos for all using (
    public.has_role('responsable') or public.has_role('administrateur')
  ) with check (
    public.has_role('responsable') or public.has_role('administrateur')
  );

create policy "Lecture des ressources publiées ou par le staff"
  on public.spiritual_resources for select using (
    is_published or public.has_role('responsable') or public.has_role('administrateur')
  );
create policy "Responsable/Administrateur gèrent les ressources spirituelles"
  on public.spiritual_resources for all using (
    public.has_role('responsable') or public.has_role('administrateur')
  ) with check (
    public.has_role('responsable') or public.has_role('administrateur')
  );

-- Bucket public (contenu non sensible, destiné à être vu par tous les
-- comptes connectés) : pas besoin d'URL signée comme pour child-photos.
insert into storage.buckets (id, name, public)
values ('home-photos', 'home-photos', true)
on conflict (id) do nothing;

create policy "Responsable/Administrateur gèrent les fichiers du hub d'accueil"
  on storage.objects for all using (
    bucket_id = 'home-photos' and (public.has_role('responsable') or public.has_role('administrateur'))
  ) with check (
    bucket_id = 'home-photos' and (public.has_role('responsable') or public.has_role('administrateur'))
  );

-- Le detail "Voir Descriptif" d'une classe liste ses moniteurs pour
-- n'importe quel rôle (pas seulement les parents concernés) : il faut donc
-- élargir la lecture de moniteur_rooms (jusque-là restreinte par rôle), et
-- résoudre le nom du moniteur sans exposer le reste de son profil (même
-- principe que contact_profiles/exercise_questions_public plus haut : une
-- vue sans security_invoker, pas de nouvelle policy select sur profiles,
-- pour ne jamais risquer de fuiter la colonne "phone").
create policy "Tout utilisateur authentifié lit les affectations moniteur"
  on public.moniteur_rooms for select using (auth.uid() is not null);

create view public.moniteur_directory as
  select p.id, p.username
  from public.profiles p
  join public.user_roles ur on ur.user_id = p.id and ur.role = 'moniteur';

