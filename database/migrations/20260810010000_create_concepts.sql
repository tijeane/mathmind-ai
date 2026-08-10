-- Migration: create concepts
-- Phase: 2 (Learning)
-- Per DB-000 (canonical table template, soft deletes) and MM-203
-- (Concept Engine) in IMPLEMENTATION_BACKLOG.md.
--
-- This is a minimal skill-graph representation per MM-LRN-001 - a single
-- nullable prerequisite_concept_id, not the full prerequisite/related/
-- dependent-skill graph structure. description is required (not
-- optional) because MM-501 (Context Builder) depends on having the
-- concept's explanation available.
--
-- Same Tier 0 / RLS reasoning as courses (MM-200): public educational
-- content, RLS enabled for consistency rather than strict necessity.
--
-- Rollback: drop view public.vw_concepts_active;
--           drop policy "authenticated_read_concepts" on public.concepts;
--           drop trigger trg_concepts_updated_at on public.concepts;
--           drop table public.concepts;

begin;

create table public.concepts (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null
    references public.courses (id) on delete restrict,
  title text not null,
  description text not null,
  sequence_order integer not null,
  -- Optional ownership (DB-000 Foreign Key Policy exception): a concept
  -- with no prerequisite is the start of a course's sequence, and
  -- deleting a prerequisite shouldn't cascade-delete everything after
  -- it - it should just drop the dependency link.
  prerequisite_concept_id uuid
    references public.concepts (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,

  constraint chk_concepts_title_not_blank
    check (length(trim(title)) > 0),
  constraint chk_concepts_description_not_blank
    check (length(trim(description)) > 0),
  constraint chk_concepts_sequence_order_positive
    check (sequence_order > 0),
  constraint uq_concepts_course_id_sequence_order
    unique (course_id, sequence_order)
);

comment on table public.concepts is
  'MM-203: hand-seeded skill-graph nodes for a course. Tier 0 (DB-000). '
  'prerequisite_concept_id is a single link, not the full graph from '
  'MM-LRN-001 - sufficient for MVP sequencing, not adaptive routing.';

create index idx_concepts_course_id
  on public.concepts (course_id);

create index idx_concepts_prerequisite_concept_id
  on public.concepts (prerequisite_concept_id);

create trigger trg_concepts_updated_at
before update on public.concepts
for each row
execute function public.fn_set_updated_at();

alter table public.concepts enable row level security;

create policy "authenticated_read_concepts"
on public.concepts
for select
to authenticated
using (deleted_at is null);

-- DB-000 Soft Deletes: same security_invoker pattern as
-- vw_courses_active (MM-200) - re-checks RLS as the querying user.
create view public.vw_concepts_active
with (security_invoker = true)
as
select id, course_id, title, description, sequence_order, prerequisite_concept_id, created_at, updated_at
from public.concepts
where deleted_at is null;

-- Seed 7 concepts for the "Fractions Foundations" course (MM-200), in
-- prerequisite order. Chained via CTEs so each insert can reference the
-- previous concept's generated id without hardcoding UUIDs.
with course as (
  select id from public.courses where title = 'Fractions Foundations'
),
c1 as (
  insert into public.concepts (course_id, title, description, sequence_order)
  select course.id,
    'Understanding Parts of a Whole',
    'Introduces a fraction as equal parts of a whole, using visual models like shaded shapes and number lines.',
    1
  from course
  returning id
),
c2 as (
  insert into public.concepts (course_id, title, description, sequence_order, prerequisite_concept_id)
  select course.id,
    'Numerators and Denominators',
    'Explains the role of the numerator and denominator in a fraction, and how to read and write fractions correctly.',
    2,
    c1.id
  from course, c1
  returning id
),
c3 as (
  insert into public.concepts (course_id, title, description, sequence_order, prerequisite_concept_id)
  select course.id,
    'Comparing Fractions',
    'Teaches how to compare two fractions to determine which is larger, smaller, or equal, using common denominators and visual models.',
    3,
    c2.id
  from course, c2
  returning id
),
c4 as (
  insert into public.concepts (course_id, title, description, sequence_order, prerequisite_concept_id)
  select course.id,
    'Equivalent Fractions',
    'Shows how different fractions can represent the same value, and how to generate equivalent fractions by multiplying or dividing.',
    4,
    c2.id
  from course, c2
  returning id
),
c5 as (
  insert into public.concepts (course_id, title, description, sequence_order, prerequisite_concept_id)
  select course.id,
    'Adding Fractions with Like Denominators',
    'Covers how to add two fractions that already share the same denominator.',
    5,
    c2.id
  from course, c2
  returning id
),
c6 as (
  insert into public.concepts (course_id, title, description, sequence_order, prerequisite_concept_id)
  select course.id,
    'Subtracting Fractions with Like Denominators',
    'Covers how to subtract one fraction from another when both share the same denominator.',
    6,
    c5.id
  from course, c5
  returning id
)
insert into public.concepts (course_id, title, description, sequence_order, prerequisite_concept_id)
select course.id,
  'Adding Fractions with Unlike Denominators',
  'Combines equivalent fractions and like-denominator addition to add fractions that start with different denominators.',
  7,
  c4.id
from course, c4;

commit;
