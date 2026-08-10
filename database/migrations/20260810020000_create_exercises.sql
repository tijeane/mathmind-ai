-- Migration: create exercises
-- Phase: 2 (Learning)
-- Per DB-000 (canonical table template, soft deletes) and MM-204
-- (Exercise Engine) in IMPLEMENTATION_BACKLOG.md.
--
-- MVP uses 3 difficulty levels (1=easy, 2=medium, 3=hard), not the
-- full 5-level scale from MM-LRN-001. answer_key is plain text so
-- MM-301 can do exact-match / numeric-tolerance checks later - no
-- expression parsing in MVP.
--
-- Same Tier 0 / RLS reasoning as courses (MM-200) and concepts
-- (MM-203): public educational content, RLS enabled for consistency.
--
-- Rollback: drop view public.vw_exercises_active;
--           drop policy "authenticated_read_exercises" on public.exercises;
--           drop trigger trg_exercises_updated_at on public.exercises;
--           drop table public.exercises;

begin;

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  concept_id uuid not null
    references public.concepts (id) on delete restrict,
  prompt text not null,
  -- 1 = easy, 2 = medium, 3 = hard (MVP subset of MM-LRN-001's 5 levels)
  difficulty_level integer not null,
  answer_key text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,

  constraint chk_exercises_prompt_not_blank
    check (length(trim(prompt)) > 0),
  constraint chk_exercises_answer_key_not_blank
    check (length(trim(answer_key)) > 0),
  constraint chk_exercises_difficulty_level_range
    check (difficulty_level between 1 and 3)
);

comment on table public.exercises is
  'MM-204: hand-seeded practice questions for concepts. Tier 0 (DB-000). '
  'difficulty_level is 1-3 for MVP (not the full 5 from MM-LRN-001). '
  'answer_key is plain text for exact-match / numeric-tolerance in MM-301.';

create index idx_exercises_concept_id
  on public.exercises (concept_id);

-- DoD: queryable by concept and difficulty together; composite covers
-- both single-column filters on leading concept_id and the joint case.
create index idx_exercises_concept_id_difficulty_level
  on public.exercises (concept_id, difficulty_level);

create trigger trg_exercises_updated_at
before update on public.exercises
for each row
execute function public.fn_set_updated_at();

alter table public.exercises enable row level security;

create policy "authenticated_read_exercises"
on public.exercises
for select
to authenticated
using (deleted_at is null);

-- DB-000 Soft Deletes: same security_invoker pattern as
-- vw_concepts_active (MM-203) - re-checks RLS as the querying user.
create view public.vw_exercises_active
with (security_invoker = true)
as
select id, concept_id, prompt, difficulty_level, answer_key, created_at, updated_at
from public.exercises
where deleted_at is null;

-- Seed 28 hand-written exercises across the 7 Fractions Foundations
-- concepts (MM-203). Looked up by title so we don't hardcode UUIDs.
with concepts_by_title as (
  select id, title
  from public.concepts
  where deleted_at is null
)
insert into public.exercises (concept_id, prompt, difficulty_level, answer_key)
select c.id, v.prompt, v.difficulty_level, v.answer_key
from concepts_by_title c
join (
  values
    -- Understanding Parts of a Whole (4)
    (
      'Understanding Parts of a Whole',
      'A pizza is cut into 4 equal slices. You eat 1 slice. What fraction of the pizza did you eat?',
      1,
      '1/4'
    ),
    (
      'Understanding Parts of a Whole',
      'A rectangle is divided into 8 equal parts and 3 are shaded. What fraction is shaded?',
      1,
      '3/8'
    ),
    (
      'Understanding Parts of a Whole',
      'On a number line from 0 to 1, a point is placed exactly halfway. What fraction does that point represent?',
      2,
      '1/2'
    ),
    (
      'Understanding Parts of a Whole',
      'A chocolate bar has 12 equal squares. Six squares are eaten. What fraction of the bar remains?',
      2,
      '6/12'
    ),

    -- Numerators and Denominators (4)
    (
      'Numerators and Denominators',
      'In the fraction 3/5, what is the numerator?',
      1,
      '3'
    ),
    (
      'Numerators and Denominators',
      'In the fraction 7/10, what is the denominator?',
      1,
      '10'
    ),
    (
      'Numerators and Denominators',
      'Write the fraction that means "2 out of 9 equal parts."',
      2,
      '2/9'
    ),
    (
      'Numerators and Denominators',
      'A fraction has a denominator of 6 and a numerator of 5. Write the fraction.',
      2,
      '5/6'
    ),

    -- Comparing Fractions (4)
    (
      'Comparing Fractions',
      'Which is larger: 1/4 or 3/4? Write the larger fraction.',
      1,
      '3/4'
    ),
    (
      'Comparing Fractions',
      'Which is smaller: 2/5 or 4/5? Write the smaller fraction.',
      1,
      '2/5'
    ),
    (
      'Comparing Fractions',
      'Compare 1/3 and 1/6. Which is larger?',
      2,
      '1/3'
    ),
    (
      'Comparing Fractions',
      'Are 2/4 and 1/2 equal? Answer yes or no.',
      3,
      'yes'
    ),

    -- Equivalent Fractions (4)
    (
      'Equivalent Fractions',
      'Write a fraction equivalent to 1/2 that has a denominator of 4.',
      1,
      '2/4'
    ),
    (
      'Equivalent Fractions',
      'Write a fraction equivalent to 2/3 that has a denominator of 6.',
      2,
      '4/6'
    ),
    (
      'Equivalent Fractions',
      'Simplify 4/8 to lowest terms.',
      2,
      '1/2'
    ),
    (
      'Equivalent Fractions',
      'Fill in the blank: 3/5 = ?/10',
      3,
      '6'
    ),

    -- Adding Fractions with Like Denominators (4)
    (
      'Adding Fractions with Like Denominators',
      'Add: 1/5 + 2/5. Write the sum as a fraction.',
      1,
      '3/5'
    ),
    (
      'Adding Fractions with Like Denominators',
      'Add: 3/8 + 2/8. Write the sum as a fraction.',
      1,
      '5/8'
    ),
    (
      'Adding Fractions with Like Denominators',
      'Add: 4/7 + 2/7. Write the sum as a fraction.',
      2,
      '6/7'
    ),
    (
      'Adding Fractions with Like Denominators',
      'Add: 5/12 + 5/12. Write the sum as a fraction (not mixed).',
      3,
      '10/12'
    ),

    -- Subtracting Fractions with Like Denominators (4)
    (
      'Subtracting Fractions with Like Denominators',
      'Subtract: 4/5 - 1/5. Write the difference as a fraction.',
      1,
      '3/5'
    ),
    (
      'Subtracting Fractions with Like Denominators',
      'Subtract: 7/10 - 3/10. Write the difference as a fraction.',
      1,
      '4/10'
    ),
    (
      'Subtracting Fractions with Like Denominators',
      'Subtract: 5/6 - 2/6. Write the difference as a fraction.',
      2,
      '3/6'
    ),
    (
      'Subtracting Fractions with Like Denominators',
      'Subtract: 9/8 - 3/8. Write the difference as a fraction.',
      3,
      '6/8'
    ),

    -- Adding Fractions with Unlike Denominators (4)
    (
      'Adding Fractions with Unlike Denominators',
      'Add: 1/2 + 1/4. Write the sum as a fraction.',
      2,
      '3/4'
    ),
    (
      'Adding Fractions with Unlike Denominators',
      'Add: 1/3 + 1/6. Write the sum as a fraction.',
      2,
      '1/2'
    ),
    (
      'Adding Fractions with Unlike Denominators',
      'Add: 1/4 + 1/8. Write the sum as a fraction.',
      3,
      '3/8'
    ),
    (
      'Adding Fractions with Unlike Denominators',
      'Add: 2/5 + 1/10. Write the sum as a fraction.',
      3,
      '1/2'
    )
) as v(title, prompt, difficulty_level, answer_key)
  on c.title = v.title;

commit;
