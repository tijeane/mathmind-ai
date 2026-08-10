-- Migration: create profiles table
-- Phase: 1 (Identity & Authentication)
-- Per DB-000 (canonical table template, soft deletes, UUID standard) and
-- MM-101 (Registration) in IMPLEMENTATION_BACKLOG.md.
--
-- profiles.id is deliberately the same value as auth.users.id (not its own
-- gen_random_uuid()) - this is a 1:1 extension of the Supabase-managed
-- auth.users table, not an independent entity, so it shares that identity.
-- role/RLS policies are intentionally NOT added here - that is MM-104's
-- scope. RLS is enabled now with zero policies (DB-000 "RLS enabled by
-- default"), which locks the table down until MM-104 adds the real
-- policies, rather than leaving it open in the interim.
--
-- Rollback: drop trigger trg_auth_users_create_profile on auth.users;
--           drop function public.fn_create_profile_for_new_user();
--           drop table public.profiles;

begin;

create table public.profiles (
  id uuid primary key
    references auth.users (id) on delete cascade,
  -- TIER2: PII (display_name is user-supplied, shown in the product UI)
  display_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,

  constraint chk_profiles_display_name_not_blank
    check (length(trim(display_name)) > 0)
);

comment on table public.profiles is
  'One row per auth.users entry (MM-101). id = auth.users.id. Populated '
  'automatically by trg_auth_users_create_profile, never inserted directly '
  'by application code.';

-- RLS enabled by default per DB-000 / ADR-006. No policies yet: until
-- MM-104 adds security.has_role()-based policies, only the service role
-- (which bypasses RLS) and this migration's SECURITY DEFINER trigger can
-- read or write this table.
alter table public.profiles enable row level security;

-- Generic updated_at maintenance trigger (DB-000 Naming Standards lists
-- trg_updated_at as the canonical example of this pattern).
create function public.fn_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
before update on public.profiles
for each row
execute function public.fn_set_updated_at();

-- Creates the profiles row for every new auth.users entry (MM-101
-- Deliverable), regardless of how the user was created (sign-up form,
-- Supabase dashboard, future OAuth) - this cannot be guaranteed from
-- application code alone. display_name comes from the sign-up form via
-- supabase.auth.signUp()'s options.data, stored in raw_user_meta_data;
-- falls back to the email's local part if absent (e.g. users created
-- directly in the Supabase dashboard with no metadata).
create function public.fn_create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
      split_part(new.email::text, '@', 1)
    )
  );
  return new;
end;
$$;

create trigger trg_auth_users_create_profile
after insert on auth.users
for each row
execute function public.fn_create_profile_for_new_user();

commit;
