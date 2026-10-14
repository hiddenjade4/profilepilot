-- ProfilePilot — migration 1: user profiles and career questionnaires
--
-- How to apply: Supabase dashboard → SQL Editor → New query → paste this
-- whole file → Run. It is safe to run only once per project.
--
-- Security model: Row Level Security (RLS) is enabled on every table, so the
-- database itself refuses to return or change rows that belong to another
-- user — even if application code has a bug.

-- ---------------------------------------------------------------------------
-- Shared helper: keep updated_at current on every UPDATE
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles: one row per user, for app-level details and preferences
-- ---------------------------------------------------------------------------
create table public.profiles (
  -- Same id as the Supabase Auth user. Deleting the user deletes this row.
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 100),
  -- When the user agreed to send their career details to the AI provider.
  -- Null means they haven't agreed yet, so no AI features run.
  ai_disclosure_accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'App-level details for each user. One row per auth.users row.';

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- No insert or delete policies: rows are created by the trigger below and
-- removed automatically when the auth user is deleted.

-- Create a profile automatically whenever someone signs up.
-- "security definer" lets this function write to profiles even though the
-- new user has no insert permission; the empty search_path prevents it from
-- being tricked into calling an impostor function.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Accounts created before this migration (yours!) need a profile too.
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- career_questionnaires: the onboarding answers, one questionnaire per user
-- ---------------------------------------------------------------------------
create table public.career_questionnaires (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  -- Answers are stored as JSON because questions change over time and some
  -- only appear conditionally. The server validates the shape with Zod
  -- before saving; the database enforces that it's an object of sane size.
  answers jsonb not null default '{}'::jsonb
    check (jsonb_typeof(answers) = 'object')
    check (pg_column_size(answers) <= 65536),
  status text not null default 'in_progress'
    check (status in ('in_progress', 'completed')),
  -- The question the user was on, so they can resume where they left off.
  current_step text check (char_length(current_step) <= 64),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- A completed questionnaire must record when it was completed.
  check ((status = 'completed') = (completed_at is not null))
);

comment on table public.career_questionnaires is 'Onboarding questionnaire answers. One row per user.';

create trigger career_questionnaires_set_updated_at
  before update on public.career_questionnaires
  for each row execute function public.set_updated_at();

alter table public.career_questionnaires enable row level security;

create policy "Users can view their own questionnaire"
  on public.career_questionnaires for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own questionnaire"
  on public.career_questionnaires for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own questionnaire"
  on public.career_questionnaires for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own questionnaire"
  on public.career_questionnaires for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Table permissions. RLS decides *which rows*; grants decide *which actions*.
-- Signed-out visitors ("anon") get nothing at all.
-- ---------------------------------------------------------------------------
revoke all on public.profiles from anon, authenticated;
revoke all on public.career_questionnaires from anon, authenticated;

grant select, update (display_name, ai_disclosure_accepted_at)
  on public.profiles to authenticated;
grant select, insert, update, delete
  on public.career_questionnaires to authenticated;
