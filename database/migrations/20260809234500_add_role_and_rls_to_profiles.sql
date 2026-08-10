-- Migration: add role to profiles + student-only RLS
-- Phase: 1 (Identity & Authentication)
-- Per DB-000 (RLS pattern, security helper functions) and MM-104
-- (Student Role & Authorization Foundation) in IMPLEMENTATION_BACKLOG.md.
--
-- MVP scope is `student` only (per MM-MVP-001): the CHECK constraint
-- reserves `parent`/`admin` values for forward compatibility, but no
-- parent- or admin-facing feature, route, or policy exists yet - only
-- the self-row SELECT policy below is added in this migration.
--
-- Rollback: drop policy "select_own_profile" on public.profiles;
--           drop function security.has_role(text);
--           alter table public.profiles drop constraint chk_profiles_role;
--           alter table public.profiles drop column role;

begin;

alter table public.profiles
  add column role text not null default 'student';

alter table public.profiles
  add constraint chk_profiles_role
  check (role in ('student', 'parent', 'admin'));

comment on column public.profiles.role is
  'MVP: student is the only functional role. parent/admin are reserved '
  'for forward compatibility (MM-VSN-001 phased rollout) and have no '
  'feature surface, route, or policy yet.';

-- SECURITY DEFINER so the function can read profiles.role for the
-- calling user without recursing through RLS policies defined on
-- profiles (DB-000: never join an RLS-protected table directly inside a
-- policy - go through a function in the security schema instead).
-- Not yet referenced by a policy below - MVP has nothing for it to grant
-- elevated access to (no admin/parent feature surface) - it exists now
-- so later tickets (e.g. courses RLS) have the approved helper to build
-- on rather than each reinventing an ad hoc role check.
create function security.has_role(_role text)
returns boolean
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = _role
      and deleted_at is null
  );
$$;

comment on function security.has_role(text) is
  'RLS helper (DB-000). Returns true if the calling user''s profiles.role '
  'matches _role. SECURITY DEFINER to avoid recursive RLS evaluation when '
  'used inside a policy on profiles itself.';

-- Self-row read access only. No INSERT/UPDATE/DELETE policy: rows are
-- only ever created by trg_auth_users_create_profile (MM-101, runs as
-- table owner, which bypasses RLS); application code has no supported
-- path to write profiles yet, so none is opened here.
create policy "select_own_profile"
on public.profiles
for select
using (id = auth.uid());

commit;
