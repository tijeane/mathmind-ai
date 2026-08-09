-- Migration: create extensions and security schema
-- Phase: 0 (Foundation)
-- Per DB-000 (Technology Baseline) and ADR-006 (Database Strategy)
--
-- This migration only establishes the baseline extension and the empty
-- `security` schema that Row-Level Security helper functions will live in.
-- The helper functions themselves (security.is_org_member(),
-- security.is_org_admin(), security.is_guardian(), security.has_permission())
-- are NOT created here: per DB-000 they must be SECURITY DEFINER / STABLE
-- functions that reference the organizations/org_members/users tables,
-- which do not exist until Phase 1 (Identity & Authentication). Creating
-- them now would either be no-ops or reference tables that don't exist yet.
--
-- Rollback: drop schema security; -- (only if no dependent objects exist)
--           -- pgcrypto is left enabled; safe to leave installed.

-- gen_random_uuid() (DB-000 Technology Baseline: UUID primary keys)
create extension if not exists pgcrypto;

-- Namespace for RLS helper functions (DB-000 Multi-Tenant RLS).
-- Populated starting in Phase 1 once Identity domain tables exist.
create schema if not exists security;

comment on schema security is
  'RLS helper functions (DB-000). Helper functions are added starting in '
  'Phase 1 once organizations/org_members/users tables exist. Never '
  'reference another RLS-protected table directly inside a policy - always '
  'go through a function in this schema.';
