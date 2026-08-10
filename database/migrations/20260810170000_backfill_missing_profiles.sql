-- Migration: backfill missing profiles for auth users
-- Phase: 1 (Identity) / ops fix
--
-- Root cause: POST /api/attempts failed with
-- attempts_user_id_fkey when an auth.users row had no matching
-- public.profiles row (user created before
-- trg_auth_users_create_profile, or outside the normal sign-up path).
-- Tutor/read routes still worked because they do not insert attempts.
--
-- Rollback: delete from public.profiles
--           where id in (...backfilled ids...)
--           and created_at >= <migration time>;
--           (prefer restoring from backup if unsure)

begin;

insert into public.profiles (id, display_name)
select
  u.id,
  coalesce(
    nullif(trim(u.raw_user_meta_data ->> 'display_name'), ''),
    split_part(u.email::text, '@', 1),
    'student'
  )
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

commit;
