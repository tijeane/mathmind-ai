-- Migration: revoke PUBLIC execute on profile trigger functions
-- Phase: 1 (Identity & Authentication)
-- Follow-up to harden_profile_trigger_functions.sql: revoking EXECUTE
-- from anon/authenticated individually did not remove the underlying
-- grant to the implicit PUBLIC pseudo-role, which every role (including
-- anon/authenticated) inherits from automatically - Supabase's security
-- advisor still flagged both functions as anon/authenticated-executable
-- after that migration. Revoking from PUBLIC directly is the actual fix.
--
-- Rollback: grant execute on function public.fn_set_updated_at() to public;
--           grant execute on function public.fn_create_profile_for_new_user() to public;

begin;

revoke execute on function public.fn_set_updated_at() from public;
revoke execute on function public.fn_create_profile_for_new_user() from public;

commit;
