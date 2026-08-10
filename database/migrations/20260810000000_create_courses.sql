-- Migration: create courses
-- Phase: 2 (Learning)
-- Per DB-000 (canonical table template, soft deletes) and MM-200
-- (Course Foundation) in IMPLEMENTATION_BACKLOG.md.
--
-- MVP is read-only: no admin authoring UI, no CRUD routes - courses are
-- seeded by hand in this migration (deliberately deferred CMS, per
-- MM-200's Definition of Done). courses is Tier 0 (public educational
-- content per DB-000's Data Classification), so RLS isn't strictly
-- required, but it's enabled anyway for consistency with the rest of
-- the schema and so a future "unlisted/draft course" concept is a
-- policy change rather than a new column plus app-level filtering.
--
-- Rollback: drop view public.vw_courses_active;
--           drop policy "authenticated_read_courses" on public.courses;
--           drop trigger trg_courses_updated_at on public.courses;
--           drop table public.courses;

begin;

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,

  constraint chk_courses_title_not_blank
    check (length(trim(title)) > 0),
  constraint chk_courses_description_not_blank
    check (length(trim(description)) > 0)
);

comment on table public.courses is
  'MM-200: hand-seeded course content. Tier 0 (DB-000) - no per-user '
  'sensitive data. No CRUD UI in MVP; new courses are added via '
  'migration, not through the app.';

create trigger trg_courses_updated_at
before update on public.courses
for each row
execute function public.fn_set_updated_at();

alter table public.courses enable row level security;

create policy "authenticated_read_courses"
on public.courses
for select
to authenticated
using (deleted_at is null);

-- DB-000 Soft Deletes: application code queries the *_active view, not
-- the base table. security_invoker = true so the view re-checks the
-- querying user's own RLS policy above, rather than running as the
-- table owner (the Postgres default for views, which would otherwise
-- silently bypass RLS).
create view public.vw_courses_active
with (security_invoker = true)
as
select id, title, description, created_at, updated_at
from public.courses
where deleted_at is null;

insert into public.courses (title, description)
values (
  'Fractions Foundations',
  'Build a solid understanding of fractions - from recognizing parts of a whole to comparing, adding, and subtracting fractions with confidence.'
);

commit;
