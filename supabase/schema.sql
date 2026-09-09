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

-- Planifie l'exécution automatique le 1er de chaque mois à 6h (nécessite
-- l'extension pg_cron, activable dans Database → Extensions).
-- create extension if not exists pg_cron with schema extensions;
-- select cron.schedule(
--   'sync-birthday-events-monthly',
--   '0 6 1 * *',
--   $$select public.sync_birthday_events();$$
-- );

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

-- photo_url est "obligatoire à l'inscription" côté produit (voir formulaire
-- d'onboarding), mais reste nullable en base : une contrainte NOT NULL
-- casserait les enfants déjà existants et empêcherait l'administrateur de
-- corriger une fiche incomplète en plusieurs étapes.

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
