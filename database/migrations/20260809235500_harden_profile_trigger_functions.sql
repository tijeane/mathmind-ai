-- Migration: harden profile trigger functions
-- Phase: 1 (Identity & Authentication)
-- Found via Supabase's security advisors while implementing MM-104;
-- fixed here rather than deferred to a separate ticket, since both
-- functions belong to the profiles/auth flow this phase owns.
--
-- Two issues on the trigger functions created in create_profiles.sql
-- (MM-101, already merged - migrations are immutable per DB-000, so
-- this is a new migration rather than an edit to that file):
-- 1. fn_set_updated_at() had no `search_path` pinned, unlike
--    fn_create_profile_for_new_user() - a mutable search_path is a
--    hijacking risk (DB-000 Security Standards).
-- 2. Both functions live in `public`, which PostgREST auto-exposes as
--    RPC endpoints (/rest/v1/rpc/<function>) to anon/authenticated by
--    default. Neither is meant to be called directly - they only ever
--    run as triggers - so EXECUTE is revoked from anon/authenticated.
--    (Revoking EXECUTE does not affect trigger firing: Postgres invokes
--    trigger functions directly, not through the EXECUTE privilege
--    check that applies to ordinary/RPC calls.)
--
-- Rollback: grant execute on function public.fn_set_updated_at() to anon, authenticated;
--           grant execute on function public.fn_create_profile_for_new_user() to anon, authenticated;

begin;

create or replace function public.fn_set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.fn_set_updated_at() from anon, authenticated;
revoke execute on function public.fn_create_profile_for_new_user() from anon, authenticated;

commit;
