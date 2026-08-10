-- Migration: create attempts + security.is_self helper
-- Phase: 3 (Practice)
-- Per DB-000 (canonical table template, soft deletes, RLS via security.*
-- helpers) and MM-301 (Attempt Tracking) in IMPLEMENTATION_BACKLOG.md.
--
-- attempts is Tier 3 (education records): RLS required. Students may
-- SELECT/INSERT only their own rows via security.is_self(user_id).
-- No UPDATE/DELETE policies - attempts are append-only for MVP;
-- soft-delete column exists for future admin/retention tooling.
--
-- Correctness is computed in application code (exact-match / numeric
-- tolerance) before insert; is_correct is stored, not derived by a
-- trigger, so MM-301's grading rules stay in one TypeScript module.
--
-- Rollback: drop view public.vw_attempts_active;
--           drop policy "select_own_attempts" on public.attempts;
--           drop policy "insert_own_attempts" on public.attempts;
--           drop table public.attempts;
--           drop function security.is_self(uuid);

begin;

-- Own-row helper for Tier 3 tables (DB-000: never encode auth.uid()
-- comparisons ad hoc in every policy - go through security.*).
create function security.is_self(_user_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select _user_id is not null and _user_id = auth.uid();
$$;

comment on function security.is_self(uuid) is
  'RLS helper (DB-000 / MM-301). True when _user_id equals auth.uid(). '
  'SECURITY DEFINER + pinned search_path for advisor compliance; used by '
  'attempts (and future Tier 3 tables) so own-row checks stay centralized.';

revoke all on function security.is_self(uuid) from public;
grant execute on function security.is_self(uuid) to authenticated;

create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null
    references public.profiles (id) on delete restrict,
  exercise_id uuid not null
    references public.exercises (id) on delete restrict,
  -- TIER3: education-record (student response)
  submitted_answer text not null,
  is_correct boolean not null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,

  constraint chk_attempts_submitted_answer_not_blank
    check (length(trim(submitted_answer)) > 0)
);

comment on table public.attempts is
  'MM-301: one row per submitted practice answer. Tier 3 (DB-000). '
  'Append-only for students; is_correct set by the application using '
  'exact-match / numeric-tolerance against exercises.answer_key.';

create index idx_attempts_user_id
  on public.attempts (user_id);

create index idx_attempts_exercise_id
  on public.attempts (exercise_id);

create index idx_attempts_user_id_created_at
  on public.attempts (user_id, created_at desc);

alter table public.attempts enable row level security;

create policy "select_own_attempts"
on public.attempts
for select
to authenticated
using (
  security.is_self(user_id)
  and deleted_at is null
);

create policy "insert_own_attempts"
on public.attempts
for insert
to authenticated
with check (security.is_self(user_id));

create view public.vw_attempts_active
with (security_invoker = true)
as
select id, user_id, exercise_id, submitted_answer, is_correct, created_at
from public.attempts
where deleted_at is null;

commit;
